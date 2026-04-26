<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'
import TaskDrawer from '@/components/tasks/TaskDrawer.vue'

definePageMeta({
  middleware: 'auth',
})

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

const { data: tasks, refresh } = await useApi<Task[]>('/api/v1/tasks')

const request = useApiRequest()

// Drawer
const drawerOpen = ref(false)
const selectedTask = ref<Task | null>(null)

function openTask(task: Task) {
  selectedTask.value = task
  drawerOpen.value = true
}

// Toggle complete
async function toggleStatus(task: Task) {
  await request(`/api/v1/tasks/${task.id}`, {
    method: 'PUT',
    body: {
      status: task.status === 'complete' ? 'incomplete' : 'complete',
    },
  })
  refresh()
}

// Inline add task
const newTaskTitle = ref('')
const addingTask = ref(false)

async function handleAddTask() {
  if (!newTaskTitle.value.trim()) return
  await request('/api/v1/tasks', {
    method: 'POST',
    body: { title: newTaskTitle.value.trim() },
  })
  newTaskTitle.value = ''
  addingTask.value = false
  refresh()
}

const priorityColors: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-blue-400',
}
</script>

<template>
  <NuxtLayout>
    <div class="p-8 space-y-6 max-w-3xl">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">My Tasks</h1>
      </div>

      <!-- Task list -->
      <div class="space-y-1">
        <div v-for="task in tasks" :key="task.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
          @click="openTask(task)">
          <!-- Checkbox -->
          <Checkbox :checked="task.status === 'complete'"
            class="shrink-0" @click.stop="toggleStatus(task)" />

          <!-- Title -->
          <span :class="[
            'flex-1 text-sm truncate',
            task.status === 'complete' ? 'line-through text-muted-foreground' : ''
          ]">
            {{ task.title }}
          </span>

          <!-- Priority -->
          <span v-if="task.priority"
            :class="['text-xs capitalize font-medium', priorityColors[task.priority]]">
            {{ task.priority }}
          </span>

          <!-- Due date -->
          <span v-if="task.due_date"
            class="text-xs text-muted-foreground">
            {{ new Date(task.due_date).toLocaleDateString() }}
          </span>
        </div>

        <!-- Inline add task -->
        <div v-if="addingTask"
          class="flex items-center gap-3 px-3 py-2.5">
          <Checkbox disabled class="shrink-0" />
          <input v-model="newTaskTitle"
            class="flex-1 text-sm bg-transparent focus:outline-none"
            placeholder="Task name" autofocus
            @keyup.enter="handleAddTask"
            @keyup.escape="addingTask = false" />
          <Button size="sm" @click="handleAddTask">Add</Button>
          <Button size="sm" variant="ghost"
            @click="addingTask = false">Cancel</Button>
        </div>

        <!-- Add task button -->
        <button v-if="!addingTask"
          class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full rounded-lg hover:bg-accent/50"
          @click="addingTask = true">
          <Plus class="w-4 h-4" />
          Add task
        </button>
      </div>

      <!-- Task drawer -->
      <TaskDrawer :task="selectedTask" :open="drawerOpen"
        @update:open="drawerOpen = $event" @updated="refresh()"
        @deleted="refresh()" />
    </div>
  </NuxtLayout>
</template>