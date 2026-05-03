<script setup lang="ts">
import { CalendarDays, FolderKanban, CheckSquare, Settings, LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-vue-next'

const props = defineProps<{
  sidebarOpen: boolean
}>()

const { user } = storeToRefs(useAuthStore())

const navItems = [
  { label: 'My Tasks', icon: CheckSquare, to: '/tasks', children: null },
  { label: 'Projects', icon: FolderKanban, to: '/projects', children: null },
  {
    label: 'Events',
    icon: CalendarDays,
    to: '/events',
    children: [
      // { label: 'New Submissions', to: '/events/submissions', adminOnly: true },
      { label: 'My Events', to: '/events/mine' },
    ]
  },
]

const adminItems = [
  { label: 'Event Submissions', icon: FolderKanban, to: '/events/submissions', children: null },
  { label: 'Manage Inventory', icon: FolderKanban, to: '/admin/inventory', children: null },
  { label: 'Manage Users', icon: FolderKanban, to: '/admin/manage-users', children: null },
]
</script>

<template>
  <div class="flex-1 py-3 space-y-0.5">

    <nav class="pb-4 px-2">
      <template v-for="item in navItems" :key="item.to">
        <NuxtLink :to="item.to" :class="[
          'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
          $route.path === item.to || (item.children && $route.path.startsWith(item.to))
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        ]">
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          <span v-if="sidebarOpen" class="truncate">{{ item.label
            }}</span>
        </NuxtLink>

        <!-- Children -->
        <template v-if="item.children && sidebarOpen">
          <NuxtLink v-for="child in item.children" :key="child.to"
            :to="child.to" :class="[
              'flex items-center gap-3 pl-9 pr-2 py-1.5 rounded-md text-sm transition-colors',
              $route.path.startsWith(child.to)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            ]">
            <span class="truncate">{{ child.label }}</span>
          </NuxtLink>
        </template>
      </template>
    </nav>

    <Separator />

    <!-- Admin Nav -->
    <nav v-if="user?.roles?.includes('admin')" class="px-2">
      <h3 class="uppercase text-xs font-semibold my-4 ml-2 ">
        Admin</h3>
      <template v-for="adminItem in adminItems" :key="adminItem.to">
        <NuxtLink :to="adminItem.to" :class="[
          'flex adminItems-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
          $route.path === adminItem.to || (adminItem.children && $route.path.startsWith(adminItem.to))
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        ]">
          <component :is="adminItem.icon" class="w-4 h-4 shrink-0" />
          <span v-if="sidebarOpen" class="truncate">{{ adminItem.label
            }}</span>
        </NuxtLink>
      </template>
    </nav>

  </div>
</template>