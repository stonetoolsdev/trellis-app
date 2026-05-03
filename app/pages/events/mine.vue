<script setup lang="ts">
import { CalendarDays, MapPin, Video, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import EventForm from '~/components/events/EventForm.vue'

definePageMeta({
  middleware: 'auth',
})

const selectedStatus = ref('draft')

const statusFilters = [
  { label: 'Drafts', value: 'draft' },
  { label: 'Submitted', value: 'pending_review' },
  { label: 'Rejected', value: 'rejected' },
]

const { data: events, pending, refresh } = await useApi<{ data: any[] }>('/api/v1/events/mine', {
  query: computed(() => ({
    status: selectedStatus.value,
  })),
  watch: [selectedStatus],
})

const request = useApiRequest()
const newEventOpen = ref(false)
const editingEventId = ref<string | null>(null)

function handleEventSaved() {
  newEventOpen.value = false
  editingEventId.value = null
  refresh()
}

async function handleSubmit(eventId: string) {
  await request(`/api/v1/events/${eventId}/submit`, { method: 'POST' })
  refresh()
}

const submissionColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">My Events</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your
            event submissions</p>
        </div>
        <Button size="sm" @click="newEventOpen = true">
          <Plus class="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <!-- Status filters -->
      <div class="flex items-center gap-2">
        <button v-for="filter in statusFilters" :key="filter.value"
          :class="[
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            selectedStatus === filter.value
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          ]" @click="selectedStatus = filter.value">
          {{ filter.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <!-- Empty -->
      <div v-else-if="!events?.data?.length"
        class="text-sm text-muted-foreground">
        No {{statusFilters.find(f => f.value ===
          selectedStatus)?.label.toLowerCase()}} found.
      </div>

      <!-- Event list -->
      <div v-else class="space-y-3">
        <div v-for="event in events.data" :key="event.id"
          class="p-5 rounded-xl border border-border bg-card space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <p class="text-sm font-semibold">{{ event.title }}</p>
              <p v-if="event.description"
                class="text-xs text-muted-foreground line-clamp-1">
                {{ event.description }}
              </p>
            </div>
            <span
              :class="['text-xs px-2.5 py-1 rounded-full font-medium shrink-0 capitalize', submissionColors[event.submission_status]]">
              {{ event.submission_status.replace('_', ' ') }}
            </span>
          </div>

          <!-- Meta -->
          <div
            class="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div v-if="event.start_date"
              class="flex items-center gap-1.5">
              <CalendarDays class="w-3.5 h-3.5" />
              {{ formatDate(event.start_date) }}
              <span v-if="event.end_date">→ {{
                formatDate(event.end_date) }}</span>
            </div>
            <div v-if="event.location"
              class="flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5" />
              {{ event.location }}
            </div>
            <div v-if="event.virtual_url"
              class="flex items-center gap-1.5">
              <Video class="w-3.5 h-3.5" />
              Virtual
            </div>
          </div>

          <!-- Rejection reason -->
          <div v-if="event.rejection_reason"
            class="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {{ event.rejection_reason }}
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <Button v-if="event.submission_status === 'draft'"
              size="sm" variant="outline"
              @click="editingEventId = event.id">
              Edit
            </Button>
            <Button v-if="event.submission_status === 'draft'"
              size="sm" @click="handleSubmit(event.id)">
              Submit for Review
            </Button>
          </div>
        </div>
      </div>

      <!-- New Event Modal -->
      <AppModal :open="newEventOpen" title="New Event"
        @update:open="newEventOpen = $event">
        <EventForm @saved="handleEventSaved"
          @cancelled="newEventOpen = false" />
      </AppModal>

      <!-- Edit Event Modal -->
      <AppModal :open="!!editingEventId" title="Edit Event"
        @update:open="!$event && (editingEventId = null)">
        <EventForm v-if="editingEventId" :event-id="editingEventId"
          @saved="handleEventSaved"
          @cancelled="editingEventId = null" />
      </AppModal>

    </div>
  </NuxtLayout>
</template>