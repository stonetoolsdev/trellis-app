<script setup lang="ts">
import { CalendarDays, MapPin, Video, Check, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

// Redirect non-admins
if (!authStore.user?.roles?.includes('admin')) {
  router.push('/events')
}

const selectedStatus = ref('pending_review')

const { data: events, pending, refresh } = await useApi<{ data: any[] }>('/api/v1/events/submissions', {
  query: computed(() => ({
    status: selectedStatus.value,
  })),
  watch: [selectedStatus],
})

const request = useApiRequest()

const statusFilters = [
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Rejected', value: 'rejected' },
]

const submissionColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Approve
async function handleApprove(eventId: string) {
  await request(`/api/v1/events/${eventId}/approve`, { method: 'POST' })
  refresh()
}

// Reject
const rejectingEventId = ref<string | null>(null)
const rejectionReason = ref('')

function openReject(eventId: string) {
  rejectingEventId.value = eventId
  rejectionReason.value = ''
}

async function handleReject() {
  if (!rejectingEventId.value || !rejectionReason.value.trim()) return
  await request(`/api/v1/events/${rejectingEventId.value}/reject`, {
    method: 'POST',
    body: { reason: rejectionReason.value },
  })
  rejectingEventId.value = null
  rejectionReason.value = ''
  refresh()
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Submissions</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Review and
            manage event submissions</p>
        </div>
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
              <NuxtLink :to="`/events/${event.id}`"
                class="text-sm font-semibold hover:underline">
                {{ event.title }}
              </NuxtLink>
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
            <div class="flex items-center gap-1.5">
              Submitted by {{ event.submitted_by?.name }}
            </div>
          </div>

          <!-- Rejection reason -->
          <div v-if="event.rejection_reason"
            class="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            Rejection reason: {{ event.rejection_reason }}
          </div>

          <!-- Reject form inline -->
          <div v-if="rejectingEventId === event.id" class="space-y-2">
            <textarea v-model="rejectionReason" rows="2"
              placeholder="Reason for rejection..."
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div class="flex gap-2">
              <Button size="sm" variant="destructive"
                @click="handleReject">Confirm Reject</Button>
              <Button size="sm" variant="ghost"
                @click="rejectingEventId = null">Cancel</Button>
            </div>
          </div>

          <!-- Actions -->
          <div
            v-if="event.submission_status === 'pending_review' && rejectingEventId !== event.id"
            class="flex items-center gap-2">
            <Button size="sm" @click="handleApprove(event.id)">
              <Check class="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="outline"
              class="text-destructive hover:text-destructive"
              @click="openReject(event.id)">
              <X class="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>