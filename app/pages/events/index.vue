<script setup lang="ts">
import { CalendarDays, MapPin, Video, Filter } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import EventForm from '~/components/events/EventForm.vue'

definePageMeta({
  middleware: 'auth',
})

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
  submitted_by: { id: string, name: string }
  approved_at: string | null
  teams: { id: string, name: string, color: string }[]
  created_at: string
}

const selectedStatus = ref<string>('')
const selectedFormat = ref<string>('')

const newEventOpen = ref(false)

function handleEventSaved() {
  newEventOpen.value = false
  refresh()
}

const { data: events, pending, refresh } = await useApi<{ data: any[] }>('/api/v1/events', {
  query: computed(() => ({
    status: 'approved',
    lifecycle: selectedStatus.value || undefined,
    format: selectedFormat.value || undefined,
  })),
  watch: [selectedStatus, selectedFormat],
})

const lifecycleColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  post: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <NuxtLayout>
    <div class="p-8 space-y-6 w-full max-w-none">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Events</h1>
        <Button size="sm" @click="newEventOpen = true">
          <CalendarDays class="w-4 h-4 mr-2" />
          Submit New Event
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3">
        <select v-model="selectedStatus"
          class="px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="post">Post</option>
          <option value="completed">Completed</option>
        </select>

        <select v-model="selectedFormat"
          class="px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Formats</option>
          <option value="in_person">In Person</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading events...</div>

      <!-- Empty -->
      <div v-else-if="!events?.data?.length"
        class="text-sm text-muted-foreground">
        No approved events yet.
      </div>

      <!-- Event cards -->
      <div v-else class="grid grid-cols-1 gap-4 w-full">
        <NuxtLink v-for="event in events.data" :key="event.id"
          :to="`/events/${event.id}`" class="block">
          <div
            class="p-5 rounded-xl border border-border bg-card hover:bg-accent/50">
            <div class="flex items-start justify-between gap-2 mb-3">
              <h2 class="text-sm font-semibold leading-snug">{{
                event.title }}</h2>
              <span v-if="event.lifecycle_status"
                :class="['text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize', lifecycleColors[event.lifecycle_status]]">
                {{ event.lifecycle_status.replace('_', ' ') }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div v-if="event.start_date"
                class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays class="w-3.5 h-3.5 shrink-0" />
                {{ formatDate(event.start_date) }}
                <span v-if="event.end_date">→ {{
                  formatDate(event.end_date) }}</span>
              </div>

              <div v-if="event.location"
                class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin class="w-3.5 h-3.5 shrink-0" />
                {{ event.location }}
              </div>

              <div v-else-if="event.virtual_url"
                class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video class="w-3.5 h-3.5 shrink-0" />
                Virtual event
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <AppModal :open="newEventOpen" title="New Event"
        @update:open="newEventOpen = $event">
        <EventForm @saved="handleEventSaved"
          @cancelled="newEventOpen = false" />
      </AppModal>
    </div>
  </NuxtLayout>
</template>