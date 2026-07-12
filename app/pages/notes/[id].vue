<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import TiptapEditor from '@/components/TiptapEditor.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const request = useApiRequest()

const { data: note, refresh } = await useApi<any>(`/api/v1/notes/${route.params.id}`)

const title = ref('')
const body = ref<any>(null)
const saving = ref(false)

watch(note, (val) => {
  if (val) {
    title.value = val.title
    body.value = val.body
  }
}, { immediate: true })

let saveTimer: ReturnType<typeof setTimeout>

function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(handleSave, 1500)
}

async function handleSave() {
  if (!title.value.trim()) return
  saving.value = true
  try {
    await request(`/api/v1/notes/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: title.value,
        body: body.value,
      },
    })
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  await request(`/api/v1/notes/${route.params.id}`, { method: 'DELETE' })
  router.push('/notes')
}

const isAdmin = computed(() => authStore.user?.roles?.includes('admin') || authStore.user?.roles?.includes('owner'))

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <NuxtLayout>
    <div v-if="note" class="max-w-3xl mx-auto p-10 space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <NuxtLink to="/notes"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft class="w-4 h-4" />
          Notes
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span v-if="saving"
            class="text-xs text-muted-foreground">Saving...</span>
          <span v-else class="text-xs text-muted-foreground">{{
            formatDate(note.updated_at) }}</span>
          <Button v-if="isAdmin" variant="ghost" size="sm"
            class="text-destructive hover:text-destructive"
            @click="handleDelete">
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Title -->
      <input v-model="title" type="text" placeholder="Untitled note"
        class="w-full text-3xl font-bold bg-transparent border-none focus:outline-none"
        @input="scheduleSave" />

      <!-- Meta -->
      <div
        class="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{{ note.user?.name }}</span>
        <span v-if="note.event">· {{ note.event.title }}</span>
      </div>

      <!-- Editor -->
      <div class="rounded-lg border border-border overflow-hidden">
        <ClientOnly>
          <TiptapEditor v-model="body" placeholder="Start writing..."
            @update:model-value="scheduleSave" />
        </ClientOnly>
      </div>

    </div>
  </NuxtLayout>
</template>