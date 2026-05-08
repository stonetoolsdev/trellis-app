<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
if (!authStore.user?.roles?.includes('admin')) {
  navigateTo('/dashboard')
}

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  is_active: boolean
  roles: string[]
  created_at: string
}

const { data: users, pending } = await useApi<User[]>('/api/v1/users')

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  guest: 'bg-muted text-muted-foreground',
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Manage Users</h1>
          <p class="text-sm text-muted-foreground mt-0.5">View and
            manage user accounts</p>
        </div>
        <NuxtLink to="/admin/manage-users/invite">
          <Button size="sm">
            <Plus class="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else class="space-y-2">
        <NuxtLink v-for="user in users" :key="user.id"
          :to="`/admin/manage-users/${user.id}`"
          class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
          <div
            class="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
            <img v-if="user.avatar" :src="user.avatar"
              class="w-full h-full object-cover" />
            <span v-else>{{ user.name[0] }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium">{{ user.name }}</p>
              <span v-if="!user.is_active"
                class="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
            </div>
            <p class="text-xs text-muted-foreground">{{ user.email }}
            </p>
          </div>

          <span
            :class="['text-xs px-2 py-0.5 rounded-full font-medium capitalize', roleColors[user.roles[0]] || 'bg-muted text-muted-foreground']">
            {{ user.roles[0] || 'No role' }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>