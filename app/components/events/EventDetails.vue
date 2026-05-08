<script setup lang="ts">
import { CalendarDays, MapPin, Video, ChevronRight, FolderKanban } from 'lucide-vue-next'

const props = defineProps<{
  event: {
    id: string
    start_date: string | null
    end_date: string | null
    location: string | null
    virtual_url: string | null
    description: string | null
    lifecycle_status: string | null
    submission_status: string
  }
  isAdmin: boolean
}>()

const emit = defineEmits<{
  'saved': []
}>()

const { data: projects } = await useApi<{ id: string, title: string }[]>('/api/v1/projects')
const request = useApiRequest()

async function handleFieldSave(field: string, value: string | null) {
  console.log('saving field:', field, 'value:', value)
  try {
    const result = await request(`/api/v1/events/${props.event.id}`, {
      method: 'PUT',
      body: { [field]: value },
    })
    console.log('save result:', result)
    emit('saved')
  } catch (e) {
    console.log('save error:', e)
  }
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 max-w-lg">
    <div class="flex items-start gap-3">
      <CalendarDays
        class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">Start Date</p>
        <input type="date"
          :value="event.start_date ? event.start_date.split('T')[0] : ''"
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @change="handleFieldSave('start_date', ($event.target as HTMLInputElement).value || null)" />
      </div>
    </div>

    <div class="flex items-start gap-3">
      <CalendarDays
        class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">End Date</p>
        <input type="date"
          :value="event.end_date ? event.end_date.split('T')[0] : ''"
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @change="handleFieldSave('end_date', ($event.target as HTMLInputElement).value || null)" />
      </div>
    </div>

    <div class="flex items-start gap-3">
      <MapPin class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">Location</p>
        <input type="text" :value="event.location || ''"
          placeholder="Add location"
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @blur="handleFieldSave('location', ($event.target as HTMLInputElement).value || null)" />
      </div>
    </div>

    <div class="flex items-start gap-3">
      <Video class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">Virtual URL</p>
        <input type="url" :value="event.virtual_url || ''"
          placeholder="https://..."
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @blur="handleFieldSave('virtual_url', ($event.target as HTMLInputElement).value || null)" />
      </div>
    </div>

    <div class="flex items-start gap-3">
      <CalendarDays
        class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">Description</p>
        <textarea :value="event.description || ''" rows="5"
          placeholder="Add a description..."
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          @blur="handleFieldSave('description', ($event.target as HTMLTextAreaElement).value || null)" />
      </div>
    </div>


    <div class="flex items-start gap-3">
      <FolderKanban
        class="w-4 h-4 mt-2 text-muted-foreground shrink-0" />
      <div class="flex-1 space-y-1">
        <p class="text-xs text-muted-foreground">Project</p>
        <select :value="event.project_id || ''"
          class="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          @change="handleFieldSave('project_id', ($event.target as HTMLSelectElement).value || null)">
          <option value="">No project</option>
          <option v-for="project in projects" :key="project.id"
            :value="project.id">
            {{ project.title }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>