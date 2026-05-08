<script setup lang="ts">
import { Button } from '@/components/ui/button'

definePageMeta({
  middleware: [],
  layout: false,
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const form = ref({
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  if (!form.value.password || form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/v1/reset-password', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        token: route.query.token,
        email: route.query.email,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation,
      },
    })
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (e: any) {
    error.value = e?.data?.message || 'Invalid or expired link'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background">
    <div
      class="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border bg-card shadow-sm">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">Reset Password</h1>
        <p class="text-sm text-muted-foreground">Enter your new
          password below.</p>
      </div>

      <div v-if="success" class="text-sm text-green-500">
        Password reset successfully! Redirecting to login...
      </div>

      <div v-else class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">New Password</label>
          <input v-model="form.password" type="password"
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            @keyup.enter="handleSubmit" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Confirm Password</label>
          <input v-model="form.password_confirmation" type="password"
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            @keyup.enter="handleSubmit" />
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}
        </p>

        <Button class="w-full" :disabled="loading"
          @click="handleSubmit">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </Button>
      </div>
    </div>
  </div>
</template>