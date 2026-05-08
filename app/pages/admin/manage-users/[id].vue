<script setup lang="ts">
import { Copy, Check, Trash2, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
if (!authStore.user?.roles?.includes('admin')) {
  navigateTo('/dashboard')
}

const route = useRoute()
const router = useRouter()
const request = useApiRequest()

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  pronouns: string[]
  timezone: string
  is_active: boolean
  roles: string[]
  created_at: string
}

const { data: user, refresh } = await useApi<User>(`/api/v1/users/${route.params.id}`)

const generatedLink = ref<string | null>(null)
const copied = ref(false)
const roleLoading = ref(false)
const deleteLoading = ref(false)

async function copyLink() {
  if (!generatedLink.value) return
  await navigator.clipboard.writeText(generatedLink.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function handleRoleChange(role: string) {
  roleLoading.value = true
  try {
    await request(`/api/v1/users/${route.params.id}/role`, {
      method: 'PUT',
      body: { role },
    })
    refresh()
  } finally {
    roleLoading.value = false
  }
}

async function handlePasswordReset() {
  const res = await request<{ link: string }>(`/api/v1/users/${route.params.id}/password-reset-link`, {
    method: 'POST',
  })
  generatedLink.value = res.link
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await request(`/api/v1/users/${route.params.id}`, { method: 'DELETE' })
    router.push('/admin/manage-users')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <div v-if="user" class="p-10 space-y-8 max-w-2xl">

      <!-- Back -->
      <NuxtLink to="/admin/manage-users"
        class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Back to Users
      </NuxtLink>

      <!-- Header -->
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold overflow-hidden shrink-0">
          <img v-if="user.avatar" :src="user.avatar"
            class="w-full h-full object-cover" />
          <span v-else>{{ user.name[0] }}</span>
        </div>
        <div>
          <h1 class="text-2xl font-semibold">{{ user.name }}</h1>
          <p class="text-sm text-muted-foreground">{{ user.email }}
          </p>
        </div>
        <span v-if="!user.is_active"
          class="ml-auto text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Inactive</span>
      </div>

      <div class="border-t border-border" />

      <!-- Role -->
      <div class="space-y-3">
        <h2 class="text-base font-semibold">Role</h2>
        <div class="flex items-center gap-3">
          <select :value="user.roles[0]"
            :disabled="user.id === authStore.user?.id || roleLoading"
            class="px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            @change="handleRoleChange(($event.target as HTMLSelectElement).value)">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>
          <p v-if="user.id === authStore.user?.id"
            class="text-xs text-muted-foreground">You cannot change
            your own role</p>
        </div>
      </div>

      <div class="border-t border-border" />

      <!-- Password Reset -->
      <div class="space-y-3">
        <h2 class="text-base font-semibold">Password Reset</h2>
        <p class="text-sm text-muted-foreground">Generate a password
          reset link to share with this user.</p>
        <Button variant="outline" size="sm"
          @click="handlePasswordReset">
          Generate Reset Link
        </Button>
        <div v-if="generatedLink"
          class="flex items-center gap-2 mt-2">
          <input :value="generatedLink" readonly
            class="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-muted focus:outline-none" />
          <Button size="sm" variant="outline" @click="copyLink">
            <Check v-if="copied" class="w-4 h-4 text-green-500" />
            <Copy v-else class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div class="border-t border-border" />

      <!-- Danger Zone -->
      <div class="space-y-3" v-if="user.id !== authStore.user?.id">
        <h2 class="text-base font-semibold text-destructive">Danger
          Zone</h2>
        <p class="text-sm text-muted-foreground">Permanently delete
          this user and all their data.</p>
        <Button variant="destructive" size="sm"
          :disabled="deleteLoading" @click="handleDelete">
          <Trash2 class="w-4 h-4 mr-2" />
          {{ deleteLoading ? 'Deleting...' : 'Delete User' }}
        </Button>
      </div>

    </div>
  </NuxtLayout>
</template>