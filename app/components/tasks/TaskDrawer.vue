<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
  event_id: string | null
  project_id: string | null
  assignees: { id: string, name: string }[]
  subtasks: any[]
}

const props = defineProps<{
  task: Task | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'updated': []
  'deleted': []
}>()

const request = useApiRequest()

const form = ref({
  title: '',
  description: '',
  priority: '',
  due_date: '',
  status: '',
})

watch(() => props.task, (task) => {
  if (task) {
    form.value = {
      title: task.title,
      description: task.description || '',
      priority: task.priority || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status,
    }
  }
}, { immediate: true })

async function handleUpdate() {
  if (!props.task) return
  await request(`/api/v1/tasks/${props.task.id}`, {
    method: 'PUT',
    body: {
      title: form.value.title,
      description: form.value.description || null,
      priority: form.value.priority || null,
      due_date: form.value.due_date || null,
      status: form.value.status,
    },
  })
  emit('updated')
  emit('update:open', false)
}

async function handleDelete() {
  if (!props.task) return
  await request(`/api/v1/tasks/${props.task.id}`, {
    method: 'DELETE',
  })
  emit('deleted')
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent
      class="w-[420px] sm:w-[540px] flex flex-col gap-0 p-0">
      <SheetHeader class="px-6 py-4 border-b border-border">
        <SheetTitle>
          <input v-model="form.title"
            class="w-full text-lg font-semibold bg-transparent focus:outline-none"
            placeholder="Task title" />
        </SheetTitle>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">

        <!-- Status -->
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
          <Select v-model="form.status">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incomplete">Incomplete</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Priority -->
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
          <Select v-model="form.priority">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="No priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Due Date -->
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due
            Date</label>
          <input v-model="form.due_date" type="date"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
          <textarea v-model="form.description" rows="4"
            placeholder="Add a description..."
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>

      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-border flex items-center justify-between">
        <Button variant="ghost" size="sm"
          class="text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="handleDelete">
          <Trash2 class="w-4 h-4 mr-2" />
          Delete
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm"
            @click="emit('update:open', false)">Cancel</Button>
          <Button size="sm" @click="handleUpdate">Save</Button>
        </div>
      </div>

    </SheetContent>
  </Sheet>
</template>