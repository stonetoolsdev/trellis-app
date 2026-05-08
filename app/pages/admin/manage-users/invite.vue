<script setup lang="ts">
import { ArrowLeft, Copy, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
if (!authStore.user?.roles?.includes('admin')) {
  navigateTo('/dashboard')
}

const request = useApiRequest()

const form = ref({
  name: '',
  email: '',
  role: 'member',
})

const loading = ref(false)
const error = ref('')
const generatedLink = ref<string | null>(null)
const copied = ref(false)

async function handleInvite() {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    error.value = 'Name and email are required'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await request<{ link: string }>('/api/v1/users/invite', {
      method: 'POST',
      body: form.value,
    })
    generatedLink.value = res.link
  } catch (e: any) {
    error.value = e?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!generatedLink.value) return
  await navigator.clipboard.writeText(generatedLink.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-8 max-w-2xl">

      <NuxtLink to="/admin/manage-users"
        class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft class="w-4 h-4" />
        Back to Users
      </NuxtLink>

      <div>
        <h1 class="text-2xl font-semibold">Invite User</h1>
        <p class="text-sm text-muted-foreground mt-1">Create a new
          user and generate an invite link to share with them.</p>
      </div>

      <div v-if="!generatedLink" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Name <span
              class="text-destructive">*</span></label>
          <input v-model="form.name" type="text"
            placeholder="Full name"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Email <span
              class="text-destructive">*</span></label>
          <input v-model="form.email" type="email"
            placeholder="email@example.com"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Role</label>
          <select v-model="form.role"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}
        </p>

        <Button :disabled="loading" @click="handleInvite">
          {{ loading ? 'Creating...' : 'Create & Generate Link' }}
        </Button>
      </div>

      <!-- Generated link -->
      <div v-else class="space-y-4">
        <div
          class="p-4 rounded-xl border border-border bg-card space-y-3">
          <p class="text-sm font-medium">Invite link generated!</p>
          <p class="text-sm text-muted-foreground">Share this link
            with the user so they can set their password and access
            Trellis.</p>
          <div class="flex items-center gap-2">
            <input :value="generatedLink" readonly
              class="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-muted focus:outline-none" />
            <Button size="sm" variant="outline" @click="copyLink">
              <Check v-if="copied" class="w-4 h-4 text-green-500" />
              <Copy v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="flex gap-2">
          <Button variant="outline"
            @click="generatedLink = null; form = { name: '', email: '', role: 'member' }">
            Invite Another
          </Button>
          <NuxtLink to="/admin/manage-users">
            <Button variant="ghost">Back to Users</Button>
          </NuxtLink>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>