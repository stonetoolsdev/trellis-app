<script setup lang="ts">
import { Plus, CheckSquare } from 'lucide-vue-next'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import TaskDrawer from '@/components/tasks/TaskDrawer.vue'

const props = defineProps<{
  eventId: string
  taskLists: {
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
}>()

const emit = defineEmits<{
  'refresh': []
}>()

const request = useApiRequest()

// Task list management
const addingList = ref(false)
const newListTitle = ref('')

async function handleAddList() {
  if (!newListTitle.value.trim()) return
  await request(`/api/v1/events/${props.eventId}/task-lists`, {
    method: 'POST',
    body: { title: newListTitle.value.trim() },
  })
  newListTitle.value = ''
  addingList.value = false
  emit('refresh')
}

// Task management
const addingTaskToList = ref<string | null>(null)
const newTaskTitle = ref('')

async function handleAddTask(listId: string) {
  if (!newTaskTitle.value.trim()) return
  await request('/api/v1/tasks', {
    method: 'POST',
    body: {
      title: newTaskTitle.value.trim(),
      event_id: props.eventId,
      task_list_id: listId,
    },
  })
  newTaskTitle.value = ''
  addingTaskToList.value = null
  emit('refresh')
}

async function toggleStatus(task: any) {
  await request(`/api/v1/tasks/${task.id}`, {
    method: 'PUT',
    body: { status: task.status === 'complete' ? 'incomplete' : 'complete' },
  })
  emit('refresh')
}

// Drawer
const drawerOpen = ref(false)
const selectedTask = ref<any | null>(null)

function openTask(task: any) {
  selectedTask.value = task
  drawerOpen.value = true
}

const priorityColors: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-blue-400',
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Tasks</h2>
      <Button size="sm" variant="outline" @click="addingList = true">
        <Plus class="w-4 h-4 mr-1" />
        Add List
      </Button>
    </div>

    <!-- No lists -->
    <div v-if="!taskLists?.length && !addingList"
      class="text-sm text-muted-foreground">
      No task lists yet.
    </div>

    <!-- Task lists -->
    <div v-for="list in taskLists" :key="list.id" class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">{{
        list.title }}</h3>

      <div class="space-y-1">
        <div v-for="task in list.tasks" :key="task.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
          @click="openTask(task)">
          <Checkbox :checked="task.status === 'complete'"
            class="shrink-0" @click.stop="toggleStatus(task)" />
          <span
            :class="['flex-1 text-sm truncate', task.status === 'complete' ? 'line-through text-muted-foreground' : '']">
            {{ task.title }}
          </span>
          <span v-if="task.priority"
            :class="['text-xs capitalize font-medium shrink-0', priorityColors[task.priority]]">
            {{ task.priority }}
          </span>
          <span v-if="task.due_date"
            class="text-xs text-muted-foreground shrink-0">
            {{ new Date(task.due_date).toLocaleDateString() }}
          </span>
        </div>

        <!-- Inline add task -->
        <div v-if="addingTaskToList === list.id"
          class="flex items-center gap-3 px-3 py-2">
          <Checkbox disabled class="shrink-0" />
          <input v-model="newTaskTitle"
            class="flex-1 text-sm bg-transparent focus:outline-none"
            placeholder="Task name" autofocus
            @keyup.enter="handleAddTask(list.id)"
            @keyup.escape="addingTaskToList = null" />
          <Button size="sm"
            @click="handleAddTask(list.id)">Add</Button>
          <Button size="sm" variant="ghost"
            @click="addingTaskToList = null">Cancel</Button>
        </div>

        <!-- Add task button -->
        <button v-if="addingTaskToList !== list.id"
          class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full rounded-lg hover:bg-accent/50"
          @click="addingTaskToList = list.id">
          <Plus class="w-4 h-4" />
          Add task
        </button>
      </div>
    </div>

    <!-- Add list inline -->
    <div v-if="addingList" class="flex items-center gap-2">
      <input v-model="newListTitle"
        class="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="List name" autofocus @keyup.enter="handleAddList"
        @keyup.escape="addingList = false" />
      <Button size="sm" @click="handleAddList">Add</Button>
      <Button size="sm" variant="ghost"
        @click="addingList = false">Cancel</Button>
    </div>

    <!-- Task drawer -->
    <TaskDrawer :task="selectedTask" :open="drawerOpen"
      @update:open="drawerOpen = $event" @updated="emit('refresh')"
      @deleted="emit('refresh')" />
  </div>
</template>