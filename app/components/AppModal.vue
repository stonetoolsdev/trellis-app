<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60"
          @click="emit('update:open', false)" />

        <!-- Modal -->
        <div
          class="relative z-10 w-full max-w-lg mx-4 bg-card rounded-xl border border-border shadow-xl">
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold">{{ title }}</h2>
            <button
              class="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              @click="emit('update:open', false)">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>