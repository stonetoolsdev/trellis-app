<script setup lang="ts">
import { Plus, FileText, CalendarDays } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const selectedFilter = ref('all')

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Standalone', value: 'standalone' },
  { label: 'Event Notes', value: 'events' },
]

const { data: notes, pending, refresh } = await useApi<any[]>('/api/v1/notes', {
  query: computed(() => ({
    standalone: selectedFilter.value === 'standalone' ? true : undefined,
    event_id: undefined,
  })),
  watch: [selectedFilter],
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Notes</h1>
        <NuxtLink to="/notes/new">
          <Button size="sm">
            <Plus class="w-4 h-4 mr-2" />
            New Note
          </Button>
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2">
        <button v-for="filter in filters" :key="filter.value" :class="[
          'px-3 py-1.5 text-sm rounded-md transition-colors',
          selectedFilter === filter.value
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        ]" @click="selectedFilter = filter.value">
          {{ filter.label }}
        </button>
      </div>

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else-if="!notes?.length"
        class="text-sm text-muted-foreground">
        No notes yet.
      </div>

      <div v-else class="space-y-2">
        <NuxtLink v-for="note in notes" :key="note.id"
          :to="`/notes/${note.id}`"
          class="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
          <FileText
            class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ note.title }}</p>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs text-muted-foreground">{{
                note.user?.name }}</span>
              <span v-if="note.event"
                class="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays class="w-3 h-3" />
                {{ note.event.title }}
              </span>
              <span class="text-xs text-muted-foreground">{{
                formatDate(note.created_at) }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>