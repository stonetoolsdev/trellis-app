<script setup lang="ts">
import { Plus, Users } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import AppModal from '@/components/AppModal.vue'
import ProjectForm from '~/components/projects/ProjectForm.vue'

definePageMeta({
  middleware: 'auth',
})

interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  created_by: { id: string, name: string }
  teams: { id: string, name: string, color: string }[]
  users: { id: string, name: string }[]
  created_at: string
}

const selectedStatus = ref('')

const { data: projects, pending, refresh } = await useApi<Project[]>('/api/v1/projects', {
  query: computed(() => ({
    status: selectedStatus.value || undefined,
  })),
  watch: [selectedStatus],
})

const newProjectOpen = ref(false)

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Archived', value: 'archived' },
]

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-muted text-muted-foreground',
}

function handleProjectSaved() {
  newProjectOpen.value = false
  refresh()
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">

      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <Button size="sm" @click="newProjectOpen = true">
          <Plus class="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <!-- Filters -->
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

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else-if="!projects?.length"
        class="text-sm text-muted-foreground">
        No projects yet.
      </div>

      <div v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <NuxtLink v-for="project in projects" :key="project.id"
          :to="`/projects/${project.id}`"
          class="block p-5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors space-y-3">
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-sm font-semibold">{{ project.title }}</h2>
            <span
              :class="['text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize', statusColors[project.status]]">
              {{ project.status.replace('_', ' ') }}
            </span>
          </div>

          <p v-if="project.description"
            class="text-xs text-muted-foreground line-clamp-2">
            {{ project.description }}
          </p>

          <div
            class="flex items-center gap-3 text-xs text-muted-foreground">
            <div v-if="project.teams?.length"
              class="flex items-center gap-1.5">
              <Users class="w-3.5 h-3.5" />
              {{project.teams.map(t => t.name).join(', ')}}
            </div>
            <div v-if="project.users?.length">
              {{project.users.map(u => u.name).join(', ')}}
            </div>
          </div>
        </NuxtLink>
      </div>

    </div>

    <AppModal :open="newProjectOpen" title="New Project"
      @update:open="newProjectOpen = $event">
      <ProjectForm @saved="handleProjectSaved"
        @cancelled="newProjectOpen = false" />
    </AppModal>
  </NuxtLayout>
</template>