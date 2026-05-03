<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const request = useApiRequest()

// Profile form
const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  timezone: authStore.user?.timezone || 'UTC',
  pronouns: (authStore.user?.pronouns as string[]) || [],
})

const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref('')

// Pronoun chip input
const pronounInput = ref('')

function addPronoun() {
  const val = pronounInput.value.trim()
  if (val && !profileForm.value.pronouns.includes(val)) {
    profileForm.value.pronouns.push(val)
  }
  pronounInput.value = ''
}

function removePronoun(pronoun: string) {
  profileForm.value.pronouns = profileForm.value.pronouns.filter(p => p !== pronoun)
}

async function handleProfileSave() {
  profileLoading.value = true
  profileSuccess.value = false
  profileError.value = ''
  try {
    const res = await request<any>('/api/v1/settings/profile', {
      method: 'PUT',
      body: {
        name: profileForm.value.name,
        email: profileForm.value.email,
        timezone: profileForm.value.timezone,
        pronouns: profileForm.value.pronouns,
      },
    })
    authStore.setUser(res.user)
    profileSuccess.value = true
    setTimeout(() => profileSuccess.value = false, 3000)
  } catch (e: any) {
    profileError.value = e?.data?.message || 'Something went wrong'
  } finally {
    profileLoading.value = false
  }
}

// Password form
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const passwordLoading = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref('')

async function handlePasswordSave() {
  passwordLoading.value = true
  passwordSuccess.value = false
  passwordError.value = ''
  try {
    await request('/api/v1/settings/password', {
      method: 'PUT',
      body: passwordForm.value,
    })
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
    passwordSuccess.value = true
    setTimeout(() => passwordSuccess.value = false, 3000)
  } catch (e: any) {
    passwordError.value = e?.data?.message || 'Something went wrong'
  } finally {
    passwordLoading.value = false
  }
}

// Avatar upload
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarLoading = ref(false)

async function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarLoading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await request<any>('/api/v1/settings/avatar', {
      method: 'POST',
      body: formData,
    })
    authStore.setUser(res.user)
  } catch (e: any) {
    console.error('Avatar upload failed:', e)
  } finally {
    avatarLoading.value = false
  }
}

const userInitials = computed(() => {
  if (!authStore.user?.name) return '?'
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-10 max-w-2xl">
      <h1 class="text-2xl font-semibold">Settings</h1>

      <!-- Avatar -->
      <div class="space-y-4">
        <h2 class="text-base font-semibold">Profile Photo</h2>
        <div class="flex items-center gap-5">
          <div class="relative">
            <div
              class="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-xl font-semibold overflow-hidden">
              <img v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                class="w-full h-full object-cover" />
              <span v-else>{{ userInitials }}</span>
            </div>
            <button
              class="absolute bottom-0 right-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
              :disabled="avatarLoading" @click="avatarInput?.click()">
              <Camera class="w-3 h-3" />
            </button>
            <input ref="avatarInput" type="file" accept="image/*"
              class="hidden" @change="handleAvatarChange" />
          </div>
          <div>
            <p class="text-sm font-medium">{{ authStore.user?.name }}
            </p>
            <p class="text-xs text-muted-foreground">{{
              authStore.user?.email }}</p>
          </div>
        </div>
      </div>

      <div class="border-t border-border" />

      <!-- Profile -->
      <div class="space-y-4">
        <h2 class="text-base font-semibold">Profile</h2>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Name</label>
          <input v-model="profileForm.name" type="text"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Email</label>
          <input v-model="profileForm.email" type="email"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Pronouns</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span v-for="pronoun in profileForm.pronouns"
              :key="pronoun"
              class="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
              {{ pronoun }}
              <button class="hover:text-destructive transition-colors"
                @click="removePronoun(pronoun)">×</button>
            </span>
          </div>
          <div class="flex gap-2">
            <input v-model="pronounInput" type="text"
              placeholder="e.g. He, Him, They..."
              class="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              @keyup.enter="addPronoun" />
            <Button variant="outline" size="sm"
              @click="addPronoun">Add</Button>
          </div>
          <p class="text-xs text-muted-foreground">Press Enter or
            click Add to add a pronoun</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Timezone</label>
          <select v-model="profileForm.timezone"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option v-for="tz in timezones" :key="tz" :value="tz">{{
              tz }}</option>
          </select>
        </div>

        <p v-if="profileError" class="text-sm text-destructive">{{
          profileError }}</p>
        <p v-if="profileSuccess" class="text-sm text-green-500">
          Profile updated successfully.</p>

        <Button :disabled="profileLoading" @click="handleProfileSave">
          {{ profileLoading ? 'Saving...' : 'Save Profile' }}
        </Button>
      </div>

      <div class="border-t border-border" />

      <!-- Password -->
      <div class="space-y-4">
        <h2 class="text-base font-semibold">Change Password</h2>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Current Password</label>
          <input v-model="passwordForm.current_password"
            type="password"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">New Password</label>
          <input v-model="passwordForm.password" type="password"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Confirm New
            Password</label>
          <input v-model="passwordForm.password_confirmation"
            type="password"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <p v-if="passwordError" class="text-sm text-destructive">{{
          passwordError }}</p>
        <p v-if="passwordSuccess" class="text-sm text-green-500">
          Password updated successfully.</p>

        <Button :disabled="passwordLoading"
          @click="handlePasswordSave">
          {{ passwordLoading ? 'Saving...' : 'Update Password' }}
        </Button>
      </div>

    </div>
  </NuxtLayout>
</template>