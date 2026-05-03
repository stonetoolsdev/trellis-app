<script setup lang="ts">
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  'saved': []
  'cancelled': []
}>()

const props = defineProps<{
  projectId?: string
}>()

const request = useApiRequest()
const isEditing = computed(() => !!props.projectId)

const form = ref({
  title: '',
  description: '',
  status: 'active',
})

const loading = ref(false)
const error = ref('')

if (isEditing.value) {
  const { data } = await useApi<any>(`/api/v1/projects/${props.projectId}`)
  if (data.value) {
    form.value = {
      title: data.value.title,
      description: data.value.description || '',
      status: data.value.status,
    }
  }
}

async function handleSave() {
  if (!form.value.title.trim()) {
    error.value = 'Title is required'
    return
  }
  loading.value = true
  error.value = ''
  try {
    if (isEditing.value) {
      await request(`/api/v1/projects/${props.projectId}`, {
        method: 'PUT',
        body: {
          title: form.value.title,
          description: form.value.description || null,
          status: form.value.status,
        },
      })
    } else {
      await request('/api/v1/projects', {
        method: 'POST',
        body: {
          title: form.value.title,
          description: form.value.description || null,
          status: form.value.status,
        },
      })
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
    <div class="space-y-1.5">
      <label class="text-sm font-medium">Title <span
          class="text-destructive">*</span></label>
      <input v-model="form.title" type="text"
        placeholder="Project title"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="space-y-1.5">
      <label class="text-sm font-medium">Description</label>
      <textarea v-model="form.description" rows="3"
        placeholder="What is this project about?"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
    </div>

    <div class="space-y-1.5">
      <label class="text-sm font-medium">Status</label>
      <select v-model="form.status"
        class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="active">Active</option>
        <option value="on_hold">On Hold</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <div class="flex items-center justify-end gap-2 pt-2">
      <Button variant="outline"
        @click="emit('cancelled')">Cancel</Button>
      <Button :disabled="loading" @click="handleSave">
        {{ loading ? 'Saving...' : isEditing ? 'Save Changes' :
        'Create Project' }}
      </Button>
    </div>
  </div>
</template>