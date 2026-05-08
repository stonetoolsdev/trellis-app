<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import AppModal from '@/components/AppModal.vue'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
if (!authStore.user?.roles?.includes('admin')) {
  navigateTo('/dashboard')
}

interface EventRole {
  id: string
  name: string
  description: string | null
  created_at: string
}

const { data: roles, pending, refresh } = await useApi<EventRole[]>('/api/v1/event-roles')

const request = useApiRequest()

const modalOpen = ref(false)
const editingRole = ref<EventRole | null>(null)

const form = ref({
  name: '',
  description: '',
})

const formError = ref('')
const formLoading = ref(false)

function openNew() {
  editingRole.value = null
  form.value = { name: '', description: '' }
  modalOpen.value = true
}

function openEdit(role: EventRole) {
  editingRole.value = role
  form.value = {
    name: role.name,
    description: role.description || '',
  }
  modalOpen.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) {
    formError.value = 'Name is required'
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    if (editingRole.value) {
      await request(`/api/v1/event-roles/${editingRole.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await request('/api/v1/event-roles', {
        method: 'POST',
        body: form.value,
      })
    }
    modalOpen.value = false
    refresh()
  } catch (e: any) {
    formError.value = e?.data?.message || 'Something went wrong'
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(role: EventRole) {
  await request(`/api/v1/event-roles/${role.id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Event Roles</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Define roles
            that can be assigned to events</p>
        </div>
        <Button size="sm" @click="openNew">
          <Plus class="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else-if="!roles?.length"
        class="text-sm text-muted-foreground">
        No event roles yet. Add some to get started.
      </div>

      <div v-else class="space-y-2">
        <div v-for="role in roles" :key="role.id"
          class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ role.name }}</p>
            <p v-if="role.description"
              class="text-xs text-muted-foreground mt-0.5">{{
                role.description }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              @click="openEdit(role)">
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
              @click="handleDelete(role)">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AppModal :open="modalOpen"
        :title="editingRole ? 'Edit Role' : 'Add Role'"
        @update:open="modalOpen = $event">
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Name <span
                class="text-destructive">*</span></label>
            <input v-model="form.name" type="text"
              placeholder="e.g. Photographer"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Description</label>
            <textarea v-model="form.description" rows="2"
              placeholder="What does this role involve?"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <p v-if="formError" class="text-sm text-destructive">{{
            formError }}</p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline"
              @click="modalOpen = false">Cancel</Button>
            <Button :disabled="formLoading" @click="handleSave">
              {{ formLoading ? 'Saving...'
                : editingRole ? 'Save Changes' : 'Add Role' }}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  </NuxtLayout>
</template>