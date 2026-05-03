<script setup lang="ts">
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  'saved': []
  'cancelled': []
}>()

const props = defineProps<{
  eventId?: string
}>()

const request = useApiRequest()
const isEditing = computed(() => !!props.eventId)

const form = ref({
  title: '',
  description: '',
  type: '',
  format: 'in_person',
  location: '',
  virtual_url: '',
  start_date: '',
  end_date: '',
})

const loading = ref(false)
const error = ref('')

// Load existing event if editing
if (isEditing.value) {
  const { data } = await useApi<{ data: any }>(`/api/v1/events/${props.eventId}`)
  if (data.value?.data) {
    const e = data.value.data
    form.value = {
      title: e.title,
      description: e.description || '',
      type: e.type || '',
      format: e.format,
      location: e.location || '',
      virtual_url: e.virtual_url || '',
      start_date: e.start_date ? e.start_date.split('T')[0] : '',
      end_date: e.end_date ? e.end_date.split('T')[0] : '',
    }
  }
}

async function handleSave(mode: 'draft' | 'submit' = 'draft') {
  if (!form.value.title.trim()) {
    error.value = 'Title is required'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const body = {
      title: form.value.title,
      description: form.value.description || null,
      type: form.value.type || null,
      format: form.value.format,
      location: form.value.format !== 'virtual' ? form.value.location || null : null,
      virtual_url: form.value.format !== 'in_person' ? form.value.virtual_url || null : null,
      start_date: form.value.start_date || null,
      end_date: form.value.end_date || null,
    }

    let savedEvent: any

    if (isEditing.value) {
      savedEvent = await request(`/api/v1/events/${props.eventId}`, { method: 'PUT', body })
    } else {
      savedEvent = await request('/api/v1/events', { method: 'POST', body })
    }

    if (mode === 'submit') {
      const id = savedEvent?.id || props.eventId
      await request(`/api/v1/events/${id}/submit`, { method: 'POST' })
    }

    emit('saved')
  } catch (e: any) {
    error.value = e?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Title -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Title <span
          class="text-destructive">*</span></label>
      <input v-model="form.title" type="text"
        placeholder="Event title"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <!-- Description -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Description</label>
      <textarea v-model="form.description" rows="3"
        placeholder="Describe the event..."
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
    </div>

    <!-- Type -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Type</label>
      <select v-model="form.type"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">Select type</option>
        <option value="internal-grounding">Internal Grounding</option>
        <option value="outreach">Outreach</option>
        <option value="published-analysis">Published Analysis</option>
        <option value="speak-out">Speak Out</option>
        <option value="teach-in">Teach-In</option>
        <option value="town-hall">Town Hall</option>
        <option value="other">Other</option>
      </select>
    </div>

    <!-- Format -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Format</label>
      <select v-model="form.format"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="in_person">In Person</option>
        <option value="virtual">Virtual</option>
        <option value="hybrid">Hybrid</option>
      </select>
    </div>

    <!-- Location -->
    <div v-if="form.format !== 'virtual'" class="space-y-1.5">
      <label class="text-sm font-medium">Location</label>
      <input v-model="form.location" type="text"
        placeholder="123 Main St, City, State"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <!-- Virtual URL -->
    <div v-if="form.format !== 'in_person'" class="space-y-1.5">
      <label class="text-sm font-medium">Virtual URL</label>
      <input v-model="form.virtual_url" type="url"
        placeholder="https://zoom.us/..."
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Start Date</label>
        <input v-model="form.start_date" type="date"
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">End Date</label>
        <input v-model="form.end_date" type="date"
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <!-- Actions -->
    <!-- Actions -->
    <div class="flex items-center justify-between pt-2">
      <Button variant="ghost" :disabled="loading"
        @click="handleSave('draft')">
        Save as Draft
      </Button>
      <div class="flex items-center gap-2">
        <Button variant="outline"
          @click="emit('cancelled')">Cancel</Button>
        <Button :disabled="loading" @click="handleSave('submit')">
          {{ loading ? 'Submitting...' : isEditing ? 'Save & Submit' :
            'Submit for Review' }}
        </Button>
      </div>
    </div>
  </div>
</template>