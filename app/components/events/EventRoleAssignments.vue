<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  eventId: string
  assignments: {
    id: string
    event_role: { id: string, name: string } | null
    user: { id: string, name: string } | null
    notes: string | null
    other_description: string | null
  }[]
}>()

const emit = defineEmits<{ 'refresh': [] }>()

const request = useApiRequest()

const { data: roles } = await useApi<{ id: string, name: string }[]>('/api/v1/event-roles')
const { data: users } = await useApi<{ id: string, name: string }[]>('/api/v1/users')

const adding = ref(false)
const form = ref({
  event_role_id: '',
  user_id: '',
  notes: '',
  other_description: '',
})

async function handleAdd() {
  await request(`/api/v1/events/${props.eventId}/role-assignments`, {
    method: 'POST',
    body: {
      event_role_id: form.value.event_role_id || null,
      user_id: form.value.user_id || null,
      notes: form.value.notes || null,
      other_description: form.value.other_description || null,
    },
  })
  form.value = { event_role_id: '', user_id: '', notes: '', other_description: '' }
  adding.value = false
  emit('refresh')
}

async function handleDelete(assignmentId: string) {
  await request(`/api/v1/events/${props.eventId}/role-assignments/${assignmentId}`, {
    method: 'DELETE',
  })
  emit('refresh')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Role Assignments</h2>
      <Button size="sm" variant="outline" @click="adding = !adding">
        <Plus class="w-4 h-4 mr-1" />
        Add
      </Button>
    </div>

    <!-- Add form -->
    <div v-if="adding"
      class="p-4 rounded-xl border border-border bg-card space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground">Role</label>
          <select v-model="form.event_role_id"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select role...</option>
            <option v-for="role in roles" :key="role.id"
              :value="role.id">{{ role.name }}</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground">Assign
            To</label>
          <select v-model="form.user_id"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Unassigned</option>
            <option v-for="user in users" :key="user.id"
              :value="user.id">{{ user.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="form.event_role_id === 'other'" class="space-y-1.5">
        <label
          class="text-xs font-medium text-muted-foreground">Describe
          the role</label>
        <input v-model="form.other_description" type="text"
          placeholder="e.g. Sound technician"
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="space-y-1.5">
        <label
          class="text-xs font-medium text-muted-foreground">Notes</label>
        <input v-model="form.notes" type="text"
          placeholder="Optional notes..."
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="flex gap-2 justify-end">
        <Button size="sm" variant="ghost"
          @click="adding = false">Cancel</Button>
        <Button size="sm" @click="handleAdd">Add Assignment</Button>
      </div>
    </div>

    <!-- Assignments list -->
    <div v-if="!assignments?.length && !adding"
      class="text-sm text-muted-foreground">
      No role assignments yet.
    </div>

    <div class="space-y-2">
      <div v-for="assignment in assignments" :key="assignment.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">
            {{ assignment.event_role?.name ||
              assignment.other_description || 'Unknown role' }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ assignment.user?.name || 'Unassigned' }}
            <span v-if="assignment.notes"> · {{ assignment.notes
            }}</span>
          </p>
        </div>
        <button
          class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
          @click="handleDelete(assignment.id)">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>