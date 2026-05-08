<script setup lang="ts">
import { Search, CalendarDays, FolderKanban, CheckSquare, ShoppingBasket, X } from 'lucide-vue-next'

const emit = defineEmits<{ 'close': [] }>()

const router = useRouter()
const request = useApiRequest()

const query = ref('')
const loading = ref(false)
const results = ref<{
  events: any[]
  projects: any[]
  tasks: any[]
  inventory: any[]
} | null>(null)

const searchInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  searchInput.value?.focus()
})

let debounceTimer: ReturnType<typeof setTimeout>

watch(query, (val) => {
  clearTimeout(debounceTimer)
  if (val.length < 2) {
    results.value = null
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const data = await request<any>('/api/v1/search', {
        query: { q: val },
      })
      results.value = data
    } finally {
      loading.value = false
    }
  }, 300)
})

function navigate(url: string) {
  router.push(url)
  emit('close')
}

const hasResults = computed(() =>
  results.value && (
    results.value.events.length > 0 ||
    results.value.projects.length > 0 ||
    results.value.tasks.length > 0 ||
    results.value.inventory.length > 0
  )
)

// Close on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60"
        @click="emit('close')" />

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-lg mx-4 bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        <!-- Search input -->
        <div
          class="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search class="w-4 h-4 text-muted-foreground shrink-0" />
          <input ref="searchInput" v-model="query" type="text"
            placeholder="Search events, projects, tasks..."
            class="flex-1 text-sm bg-transparent focus:outline-none" />
          <button
            class="p-1 rounded hover:bg-accent transition-colors"
            @click="emit('close')">
            <X class="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <!-- Results -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading"
            class="px-4 py-8 text-center text-sm text-muted-foreground">
            Searching...
          </div>

          <!-- No results -->
          <div v-else-if="results && !hasResults"
            class="px-4 py-8 text-center text-sm text-muted-foreground">
            No results for "{{ query }}"
          </div>

          <!-- Results grouped -->
          <div v-else-if="hasResults" class="py-2">
            <!-- Events -->
            <div v-if="results!.events.length > 0">
              <p
                class="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Events</p>
              <button v-for="item in results!.events" :key="item.id"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                @click="navigate(item.url)">
                <CalendarDays
                  class="w-4 h-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{
                    item.title }}</p>
                  <p v-if="item.subtitle"
                    class="text-xs text-muted-foreground capitalize">
                    {{ item.subtitle?.replace('_', ' ') }}</p>
                </div>
              </button>
            </div>

            <!-- Projects -->
            <div v-if="results!.projects.length > 0">
              <p
                class="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Projects</p>
              <button v-for="item in results!.projects" :key="item.id"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                @click="navigate(item.url)">
                <FolderKanban
                  class="w-4 h-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{
                    item.title }}</p>
                  <p v-if="item.subtitle"
                    class="text-xs text-muted-foreground capitalize">
                    {{ item.subtitle?.replace('_', ' ') }}</p>
                </div>
              </button>
            </div>

            <!-- Tasks -->
            <div v-if="results!.tasks.length > 0">
              <p
                class="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tasks</p>
              <button v-for="item in results!.tasks" :key="item.id"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                @click="navigate(item.url)">
                <CheckSquare
                  class="w-4 h-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{
                    item.title }}</p>
                  <p v-if="item.subtitle"
                    class="text-xs text-muted-foreground capitalize">
                    {{ item.subtitle }}</p>
                </div>
              </button>
            </div>

            <!-- Inventory -->
            <div v-if="results!.inventory.length > 0">
              <p
                class="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Inventory</p>
              <button v-for="item in results!.inventory"
                :key="item.id"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                @click="navigate(item.url)">
                <ShoppingBasket
                  class="w-4 h-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{
                    item.title }}</p>
                  <p v-if="item.subtitle"
                    class="text-xs text-muted-foreground capitalize">
                    {{ item.subtitle }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="query.length < 2"
            class="px-4 py-8 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>