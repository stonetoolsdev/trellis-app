<script setup lang="ts">
import { X, Plus } from 'lucide-vue-next'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import TiptapEditor from '@/components/TiptapEditor.vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  open: boolean
  eventId: string
  note?: {
    id: string
    title: string
    body: any
    user: { id: string, name: string }
    created_at: string
  } | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const authStore = useAuthStore()
const request = useApiRequest()

const title = ref('')
const body = ref<any>(null)
const saving = ref(false)

watch(() => props.note, (note) => {
  if (note) {
    title.value = note.title
    body.value = note.body
  } else {
    title.value = ''
    body.value = null
  }
}, { immediate: true })

watch(() => props.open, (val) => {
  if (val && !props.note) {
    title.value = ''
    body.value = null
  }
})

let saveTimer: ReturnType<typeof setTimeout>

function scheduleSave() {
  if (!props.note) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(handleSave, 1500)
}

async function handleSave() {
  if (!title.value.trim()) return
  saving.value = true
  try {
    if (props.note) {
      await request(`/api/v1/notes/${props.note.id}`, {
        method: 'PUT',
        body: { title: title.value, body: body.value },
      })
    } else {
      await request('/api/v1/notes', {
        method: 'POST',
        body: {
          title: title.value,
          body: body.value,
          event_id: props.eventId,
        },
      })
    }
    emit('saved')
    if (!props.note) emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent
      class="w-[540px] sm:w-[640px] flex flex-col gap-0 p-0">

      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-border">
        <input v-model="title" placeholder="Note title"
          class="flex-1 text-lg font-semibold bg-transparent focus:outline-none"
          @input="scheduleSave" />
        <div class="flex items-center gap-3 ml-3">
          <span v-if="saving"
            class="text-xs text-muted-foreground">Saving...</span>
          <button class="text-muted-foreground hover:text-foreground"
            @click="emit('update:open', false)">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Editor -->
      <div class="flex-1 overflow-y-auto">
        <ClientOnly>
          <TiptapEditor v-model="body" placeholder="Start writing..."
            @update:model-value="scheduleSave" />
        </ClientOnly>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-border flex items-center justify-between">
        <span v-if="note" class="text-xs text-muted-foreground">
          By {{ note.user.name }}
        </span>
        <span v-else />
        <Button v-if="!note" size="sm"
          :disabled="saving || !title.trim()" @click="handleSave">
          {{ saving ? 'Saving...' : 'Create Note' }}
        </Button>
      </div>

    </SheetContent>
  </Sheet>
</template>