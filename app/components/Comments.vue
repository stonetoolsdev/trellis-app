<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = defineProps<{
  commentableType: 'events' | 'projects' | 'tasks'
  commentableId: string
  comments: {
    id: string
    body: string
    user: { id: string, name: string }
    created_at: string
  }[]
}>()

const emit = defineEmits<{
  'refresh': []
}>()

const authStore = useAuthStore()
const request = useApiRequest()
const newComment = ref('')

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function handleAddComment() {
  if (!newComment.value.trim()) return
  await request(`/api/v1/${props.commentableType}/${props.commentableId}/comments`, {
    method: 'POST',
    body: { body: newComment.value },
  })
  newComment.value = ''
  emit('refresh')
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Comments</h2>

    <div v-if="!comments?.length"
      class="text-sm text-muted-foreground">
      No comments yet.
    </div>

    <div class="space-y-4">
      <div v-for="comment in comments" :key="comment.id"
        class="flex gap-3">
        <div
          class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
          {{ comment.user.name[0] }}
        </div>
        <div class="flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ comment.user.name
              }}</span>
            <span class="text-xs text-muted-foreground">{{
              formatDate(comment.created_at) }}</span>
          </div>
          <div class="text-sm text-muted-foreground"
            v-html="comment.body" />
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <div
        class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {{ authStore.user?.name?.[0] }}
      </div>
      <div class="flex-1 space-y-2">
        <textarea v-model="newComment" rows="3"
          placeholder="Add a comment..."
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        <Button size="sm" @click="handleAddComment">Comment</Button>
      </div>
    </div>
  </div>
</template>