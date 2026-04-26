<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <NuxtLayout>
    <div class="p-8 space-y-4">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-muted-foreground">Welcome, {{
        authStore.user?.name
        }}</p>
      <Button variant="outline" @click="handleLogout">Sign
        out</Button>
    </div>
  </NuxtLayout>
</template>