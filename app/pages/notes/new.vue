<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import TiptapEditor from '@/components/TiptapEditor.vue'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const request = useApiRequest()

const title = ref('')
const body = ref<any>(null)
const eventId = ref('')
const loading = ref(false)
const error = ref('')

// Fetch events for linking
const { data: eventsResponse } = await useApi<{ data: any[] }>('/api/v1/events')
const events = computed(() => eventsResponse.value?.data || [])

async function handleCreate() {
  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }
  loading.value = true
  try {
    const note = await request<any>('/api/v1/notes', {
      method: 'POST',
      body: {
        title: title.value,
        body: body.value,
        event_id: eventId.value || null,
      },
    })
    router.push(`/notes/${note.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <div class="max-w-3xl mx-auto p-10 space-y-6">

      <NuxtLink to="/notes"
        class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Notes
      </NuxtLink>

      <input v-model="title" type="text" placeholder="Untitled note"
        class="w-full text-3xl font-bold bg-transparent border-none focus:outline-none" />

      <!-- Link to event -->
      <div class="space-y-1.5">
        <label class="text-xs text-muted-foreground">Link to event
          (optional)</label>
        <select v-model="eventId"
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">No event</option>
          <option v-for="event in events" :key="event.id"
            :value="event.id">
            {{ event.title }}
          </option>
        </select>
      </div>

      <ClientOnly>
        <div class="rounded-lg border border-border overflow-hidden">
          <TiptapEditor v-model="body"
            placeholder="Start writing..." />
        </div>
      </ClientOnly>

      <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

      <div class="flex gap-2">
        <Button :disabled="loading" @click="handleCreate">
          {{ loading ? 'Creating...' : 'Create Note' }}
        </Button>
        <Button variant="outline"
          @click="router.push('/notes')">Cancel</Button>
      </div>

    </div>
  </NuxtLayout>
</template>