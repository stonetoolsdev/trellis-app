<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import TaskLists from '@/components/TaskLists.vue'
import Comments from '@/components/Comments.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()

interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  created_by: { id: string, name: string }
  teams: { id: string, name: string, color: string }[]
  users: { id: string, name: string }[]
  task_lists: {
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
  comments: {
    id: string
    body: string
    user: { id: string, name: string }
    created_at: string
  }[]
  created_at: string
}

const { data: project, pending, refresh } = await useApi<Project>(`/api/v1/projects/${route.params.id}`)

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-muted text-muted-foreground',
}
</script>

<template>
  <NuxtLayout>
    <div v-if="pending" class="p-10 text-sm text-muted-foreground">
      Loading...</div>

    <div v-else-if="project" class="p-10 space-y-10 max-w-4xl">

      <!-- Header -->
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-3xl font-semibold">{{ project.title }}</h1>
          <span
            :class="['text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0', statusColors[project.status]]">
            {{ project.status.replace('_', ' ') }}
          </span>
        </div>

        <p v-if="project.description" class="text-muted-foreground">{{
          project.description }}</p>

        <div
          class="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div v-if="project.teams?.length"
            class="flex items-center gap-1.5">
            <Users class="w-4 h-4" />
            {{project.teams.map(t => t.name).join(', ')}}
          </div>
          <div v-if="project.users?.length"
            class="flex items-center gap-1.5">
            {{project.users.map(u => u.name).join(', ')}}
          </div>
          <div class="text-sm text-muted-foreground">
            Created by {{ project.created_by?.name }}
          </div>
        </div>
      </div>

      <TaskLists context-type="project" :context-id="project.id"
        :task-lists="project.task_lists" @refresh="refresh()" />

      <Comments commentable-type="projects"
        :commentable-id="project.id" :comments="project.comments"
        @refresh="refresh()" />

    </div>
  </NuxtLayout>
</template>