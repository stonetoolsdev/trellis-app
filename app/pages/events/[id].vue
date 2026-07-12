<script setup lang="ts">
import { ChevronRight, Camera, Plus } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import TaskLists from '@/components/TaskLists.vue'
import Comments from '@/components/Comments.vue'
import EventDetails from '@/components/events/EventDetails.vue'
import EventRoleAssignments from '@/components/events/EventRoleAssignments.vue'
import EventInventoryNeeds from '@/components/events/EventInventoryNeeds.vue'
import EventNoteDrawer from '@/components/events/EventNoteDrawer.vue'

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
  goals: string | null
  type: string
  format: string
  submission_status: string
  lifecycle_status: string | null
  location: string | null
  virtual_url: string | null
  featured_photo_url: string | null
  project_id: string | null
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
  role_assignments: any[]
  inventory: any[]
  notes: {
    id: string
    title: string
    body: any
    user: { id: string, name: string }
    created_at: string
    updated_at: string
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

const lifecycleLabel = computed(() =>
  event.value?.data?.lifecycle_status?.replace('_', ' ') || 'Not started'
)

const nextLifecycleLabel = computed(() => {
  const current = event.value?.data?.lifecycle_status
  if (!current) return ''
  return lifecycleSteps[lifecycleSteps.indexOf(current) + 1]?.replace('_', ' ') || ''
})

async function handleAdvance() {
  await request(`/api/v1/events/${route.params.id}/advance`, { method: 'POST' })
  refresh()
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

const notesDrawerOpen = ref(false)
const selectedNote = ref<any | null>(null)

function openNewNote() {
  selectedNote.value = null
  notesDrawerOpen.value = true
}

function openNote(note: any) {
  selectedNote.value = note
  notesDrawerOpen.value = true
}
</script>

<template>
<NuxtLayout>
  <div v-if="pending" class="p-10 text-sm text-muted-foreground">
    Loading...</div>

  <div v-else-if="event?.data" class="flex flex-col h-full">

    <!-- Featured Photo -->
    <div v-if="event.data.featured_photo_url"
      class="w-full h-48 overflow-hidden shrink-0">
      <img :src="event.data.featured_photo_url"
        class="w-full h-full object-cover" />
    </div>
    <div v-else
      class="w-full h-32 border-b border-dashed border-border flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors shrink-0"
      @click="photoInput?.click()">
      <div
        class="flex items-center gap-2 text-sm text-muted-foreground">
        <Camera class="w-4 h-4" />
        Add featured photo
      </div>
    </div>
    <input ref="photoInput" type="file" accept="image/*"
      class="hidden" @change="handlePhotoUpload" />

    <!-- Header -->
    <div class="px-10 py-6 border-b border-border space-y-3 shrink-0">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-3xl font-semibold">{{ event.data.title }}</h1>
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

      <!-- Advance button -->
      <div
        v-if="isAdmin && event.data.submission_status === 'approved' && event.data.lifecycle_status !== 'completed'"
        class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium capitalize">{{
            lifecycleLabel }}</span>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm text-muted-foreground capitalize">{{
            nextLifecycleLabel }}</span>
        </div>
        <Button size="sm" @click="handleAdvance">
          Advance to {{ nextLifecycleLabel }}
          <ChevronRight class="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>

    <!-- Details -->
    <div class="px-10 py-6 border-b border-border shrink-0">
      <EventDetails :event="event.data" :is-admin="isAdmin"
        @saved="refresh()" />
    </div>

    <!-- Tabs -->
    <div class="px-10 py-6 flex-1 min-h-96">
      <Tabs default-value="tasks">
        <TabsList class="mb-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskLists context-type="event" :context-id="event.data.id"
            :task-lists="event.data.task_lists"
            @refresh="refresh()" />
        </TabsContent>

        <TabsContent value="people">
          <EventRoleAssignments :event-id="event.data.id"
            :assignments="event.data.role_assignments || []"
            @refresh="refresh()" />
        </TabsContent>

        <TabsContent value="inventory">
          <EventInventoryNeeds :event-id="event.data.id"
            :inventory="event.data.inventory || []"
            @refresh="refresh()" />
        </TabsContent>

        <TabsContent value="notes">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Notes</h2>
              <Button size="sm" variant="outline"
                @click="openNewNote">
                <Plus class="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
            <div v-if="!event.data.notes?.length"
              class="text-sm text-muted-foreground">
              No notes yet.
            </div>
            <div class="space-y-2">
              <button v-for="note in event.data.notes" :key="note.id"
                class="w-full flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left"
                @click="openNote(note)">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ note.title }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{
                    note.user.name }} · {{ new
                      Date(note.created_at).toLocaleDateString() }}</p>
                </div>
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <Comments commentable-type="events"
            :commentable-id="event.data.id"
            :comments="event.data.comments" @refresh="refresh()" />
        </TabsContent>
      </Tabs>
    </div>

  </div>

  <!-- Notes Drawer -->
  <EventNoteDrawer :open="notesDrawerOpen"
    :event-id="event?.data?.id || ''" :note="selectedNote"
    @update:open="notesDrawerOpen = $event" @saved="refresh()" />

</NuxtLayout>
</template>