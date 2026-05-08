<script setup lang="ts">
import { CalendarDays, MapPin, Video, Users, ChevronRight, Camera } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import EventDetails from '~/components/events/EventDetails.vue'
import EventRoleAssignments from '~/components/events/EventRoleAssignments.vue'
import EventInventoryNeeds from '~/components/events/EventInventoryNeeds.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()

interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  type: string
  format: string
  submission_status: string
  lifecycle_status: string | null
  location: string | null
  virtual_url: string | null
  start_date: string | null
  end_date: string | null
  rejection_reason: string | null
  submitted_by: { id: string, name: string }
  approved_by: { id: string, name: string } | null
  approved_at: string | null
  teams: { id: string, name: string, color: string }[]
  task_lists: {
    id: string
    title: string
    order: number
    tasks: {
      id: string
      title: string
      status: string
      priority: string | null
      due_date: string | null
      assignees: { id: string, name: string }[]
      subtasks: any[]
    }[]
  }[]
  comments: {
    id: string
    body: string
    user: { id: string, name: string }
    created_at: string
  }[]
  created_at: string
}

const isAdmin = computed(() => authStore.user?.roles?.includes('admin'))
const request = useApiRequest()
const { data: event, pending, refresh } = await useApi<{ data: Event }>(`/api/v1/events/${route.params.id}`)

const lifecycleSteps = ['planning', 'in_progress', 'post', 'completed']

const lifecycleColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  post: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const submissionColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

async function handleFieldSave(field: string, value: string | null) {
  await request(`/api/v1/events/${route.params.id}`, {
    method: 'PUT',
    body: { [field]: value },
  })
  refresh()
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function handleAdvance() {
  await request(`/api/v1/events/${route.params.id}/advance`, { method: 'POST' })
  refresh()
}

// Comments
const newComment = ref('')

async function handleAddComment() {
  if (!newComment.value.trim()) return
  try {
    const comment = await request<any>(`/api/v1/events/${route.params.id}/comments`, {
      method: 'POST',
      body: { body: newComment.value },
    })
    if (event.value?.data?.comments) {
      event.value.data.comments.push({
        id: comment.id,
        body: comment.body,
        user: { id: authStore.user!.id, name: authStore.user!.name },
        created_at: comment.created_at,
      })
    }
    newComment.value = ''
  } catch (e) {
    console.log('error:', e)
  }
}

const photoInput = ref<HTMLInputElement | null>(null)
const photoLoading = ref(false)

async function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoLoading.value = true
  try {
    const formData = new FormData()
    formData.append('photo', file)
    await request(`/api/v1/events/${route.params.id}/photo`, {
      method: 'POST',
      body: formData,
    })
    refresh()
  } catch (e: any) {
    console.error('Photo upload failed:', e)
  } finally {
    photoLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <div v-if="pending" class="p-10 text-sm text-muted-foreground">
      Loading...</div>

    <div v-else-if="event?.data" class="p-10 space-y-10 max-w-4xl">



      <!-- Header -->
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-3xl font-semibold">{{ event.data.title }}
          </h1>
          <div class="flex items-center gap-2 shrink-0">
            <span
              :class="['text-xs px-2.5 py-1 rounded-full font-medium capitalize', submissionColors[event.data.submission_status]]">
              {{ event.data.submission_status.replace('_', ' ') }}
            </span>
            <span v-if="event.data.lifecycle_status"
              :class="['text-xs px-2.5 py-1 rounded-full font-medium capitalize', lifecycleColors[event.data.lifecycle_status]]">
              {{ event.data.lifecycle_status.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <!-- Featured Photo -->
        <div class="relative">
          <div v-if="event.data.featured_photo_url"
            class="w-full h-48 rounded-xl overflow-hidden bg-muted">
            <img :src="event.data.featured_photo_url"
              class="w-full h-full object-cover" />
          </div>
          <div v-else
            class="w-full h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            @click="photoInput?.click()">
            <div class="text-center space-y-2">
              <Camera class="w-8 h-8 text-muted-foreground mx-auto" />
              <p class="text-sm text-muted-foreground">Click to upload
                a featured photo</p>
            </div>
          </div>

          <!-- Change photo button when photo exists -->
          <button v-if="event.data.featured_photo_url"
            class="absolute bottom-3 right-3 px-3 py-1.5 text-xs rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center gap-1.5"
            @click="photoInput?.click()">
            <Camera class="w-3.5 h-3.5" />
            Change photo
          </button>

          <input ref="photoInput" type="file" accept="image/*"
            class="hidden" @change="handlePhotoUpload" />
        </div>

        <!-- Editable details -->
        <EventDetails :event="event.data" :is-admin="isAdmin ?? false"
          @saved="refresh()" />

        <!-- Admin workflow actions -->
        <div
          v-if="isAdmin && event.data.submission_status === 'approved' && event.data.lifecycle_status !== 'completed'"
          class="flex items-center gap-3 pt-2">
          <div class="flex-1">
            <p class="text-xs text-muted-foreground mb-1">Current
              stage</p>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium capitalize">
                {{ event.data.lifecycle_status?.replace('_', ' ') ||
                  'Not started' }}</span>
              <ChevronRight class="w-4 h-4 text-muted-foreground" />
              <span class="text-sm text-muted-foreground capitalize">
                {{
                  lifecycleSteps[lifecycleSteps.indexOf(event.data.lifecycle_status!)
                    + 1]?.replace('_', ' ') }}
              </span>
            </div>
          </div>
          <Button @click="handleAdvance">
            Advance to {{
              lifecycleSteps[lifecycleSteps.indexOf(event.data.lifecycle_status!)
                + 1]?.replace('_', ' ') }}
            <ChevronRight class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <TaskLists context-type="event" :context-id="event.data.id"
        :task-lists="event.data.task_lists" @refresh="refresh()" />

      <EventRoleAssignments :event-id="event.data.id"
        :assignments="event.data.role_assignments || []"
        @refresh="refresh()" />

      <EventInventoryNeeds :event-id="event.data.id"
        :inventory="event.data.inventory || []"
        @refresh="refresh()" />

      <!-- Comments -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Comments</h2>

        <div v-if="!event.data.comments?.length"
          class="text-sm text-muted-foreground">
          No comments yet.
        </div>

        <div class="space-y-4">
          <div v-for="comment in event.data.comments"
            :key="comment.id" class="flex gap-3">
            <div
              class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
              {{ comment.user.name[0] }}
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ comment.user.name
                }}</span>
                <span class="text-xs text-muted-foreground">{{
                  formatDate(comment.created_at) }}</span>
              </div>
              <div class="text-sm text-muted-foreground"
                v-html="comment.body" />
            </div>
          </div>
        </div>

        <!-- Add comment -->
        <div class="flex gap-3 pt-2">
          <div
            class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
            {{ authStore.user?.name?.[0] }}
          </div>
          <div class="flex-1 space-y-2">
            <textarea v-model="newComment" rows="3"
              placeholder="Add a comment..."
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <Button size="sm"
              @click="handleAddComment">Comment</Button>
          </div>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>