<script setup lang="ts">
import SidebarNav from '~/components/SidebarNav.vue'
import { ref } from 'vue'
import { CalendarDays, FolderKanban, CheckSquare, Settings, LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(true)

const userInitials = computed(() => {
  if (!authStore.user?.name) return '?'
  return authStore.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">

    <!-- Sidebar -->
    <aside :class="[
      'flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0',
      sidebarOpen ? 'w-60' : 'w-14'
    ]">
      <!-- Logo + Toggle -->
      <div
        class="flex items-center justify-between px-3 py-4 h-14 mb-8">
        <span v-if="sidebarOpen"
          class="font-semibold text-base tracking-tight text-sidebar-foreground">Trellis</span>
        <button
          class="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          @click="sidebarOpen = !sidebarOpen">
          <PanelLeftClose v-if="sidebarOpen" class="w-4 h-4" />
          <PanelLeftOpen v-else class="w-4 h-4" />
        </button>
      </div>

      <Separator />

      <!-- Nav -->
      <SidebarNav :sidebar-open />


      <!-- User -->
      <div class="p-2">
        <Popover>
          <PopoverTrigger as-child>
            <button :class="[
              'flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors',
              !sidebarOpen && 'justify-center'
            ]">
              <Avatar class="w-7 h-7 shrink-0">
                <AvatarImage
                  :src="authStore.user?.avatar_url || ''" />
                <AvatarFallback class="text-xs">{{ userInitials }}
                </AvatarFallback>
              </Avatar>
              <div v-if="sidebarOpen"
                class="flex-1 text-left overflow-hidden">
                <p
                  class="text-sm font-medium truncate text-sidebar-foreground">
                  {{ authStore.user?.name }}</p>
                <p
                  class="text-xs text-sidebar-foreground/60 truncate">
                  {{ authStore.user?.email }}</p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-56 p-2" side="top" align="start">
            <div class="px-2 py-1.5 mb-1">
              <p class="text-sm font-medium">{{ authStore.user?.name
              }}</p>
              <p class="text-xs text-muted-foreground">{{
                authStore.user?.email }}</p>
            </div>
            <Separator class="my-1" />
            <NuxtLink to="/settings"
              class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors w-full">
              <Settings class="w-4 h-4" />
              Settings
            </NuxtLink>
            <button
              class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors w-full text-destructive"
              @click="handleLogout">
              <LogOut class="w-4 h-4" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-col flex-1 overflow-hidden">

      <!-- Top bar -->
      <header
        class="h-14 border-b border-border flex items-center px-4 shrink-0">
        <div class="relative w-full max-w-md">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search..."
            class="w-full pl-9 pr-4 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>

    </div>
  </div>
</template>