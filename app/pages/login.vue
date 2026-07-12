<script setup lang="ts">
import TrellisLogoSvgBlack from '@/assets/images/trellis-logo-horizontal-black.png'
import TrellisLogoSvgWhite from '@/assets/images/trellis-logo-horizontal-white.png'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value, remember.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || 'Invalid credentials'
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

      <div class="w-1/2 h-auto mb-6">
        <img :src="TrellisLogoSvgBlack"
          class="w-full h-auto dark:hidden" />
        <img :src="TrellisLogoSvgWhite"
          class="w-full h-auto hidden dark:block" />
      </div>

      <h1 class="hidden">Sign in to
        Trellis</h1>

      <p class="text-sm text-muted-foreground">Enter your email and
        password to continue</p>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Email</label>
        <input v-model="email" type="email"
          placeholder="you@example.com"
          class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          @keyup.enter="handleLogin" />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Password</label>
        <input v-model="password" type="password"
          placeholder="••••••••"
          class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          @keyup.enter="handleLogin" />
      </div>

      <div class="flex items-center gap-2">
        <input id="remember" v-model="remember" type="checkbox"
          class="h-4 w-4 rounded border-input" />
        <label for="remember"
          class="text-sm text-muted-foreground">Remember me</label>
      </div>

      <p v-if="error" class="text-sm text-destructive">{{ error }}
      </p>

      <Button class="w-full" :disabled="loading" @click="handleLogin">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </Button>
    </div>
  </div>
</div>
</template>