<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()

interface UserProfile {
  id: string
  name: string
  pronouns: string[]
  avatar: string | null
  timezone: string
  roles: string[]
}

const { data: profile, pending } = await useApi<UserProfile>(`/api/v1/users/${route.params.id}/profile`)

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  guest: 'bg-muted text-muted-foreground',
}
</script>

<template>
  <NuxtLayout>
    <div v-if="pending" class="p-10 text-sm text-muted-foreground">
      Loading...</div>

    <div v-else-if="profile" class="p-10 max-w-xl space-y-8">

      <!-- Avatar + Name -->
      <div class="flex items-center gap-5">
        <div
          class="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold overflow-hidden shrink-0">
          <img v-if="profile.avatar" :src="profile.avatar"
            class="w-full h-full object-cover" />
          <span v-else>{{ profile.name[0] }}</span>
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">{{ profile.name }}</h1>
          <div v-if="profile.pronouns?.length"
            class="flex flex-wrap gap-1.5">
            <span v-for="pronoun in profile.pronouns" :key="pronoun"
              class="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              {{ pronoun }}
            </span>
          </div>
          <div class="flex gap-1.5 mt-1">
            <span v-for="role in profile.roles" :key="role"
              :class="['text-xs px-2 py-0.5 rounded-full font-medium capitalize', roleColors[role] || 'bg-muted text-muted-foreground']">
              {{ role }}
            </span>
          </div>
        </div>
      </div>

      <div class="border-t border-border" />

      <!-- Details -->
      <div class="space-y-3 text-sm">
        <div class="flex items-center gap-3">
          <span
            class="text-muted-foreground w-24 shrink-0">Timezone</span>
          <span>{{ profile.timezone }}</span>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>