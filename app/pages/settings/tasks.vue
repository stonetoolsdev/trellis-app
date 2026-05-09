<script setup lang="ts">
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, Globe, Lock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import AppModal from '@/components/AppModal.vue'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const request = useApiRequest()

interface TemplateItem {
  id?: string
  title: string
  description: string
  priority: string
  order: number
}

interface Template {
  id: string
  name: string
  description: string | null
  is_public: boolean
  user_id: string
  items: TemplateItem[]
}

const { data: templates, pending, refresh } = await useApi<Template[]>('/api/v1/task-list-templates')

const modalOpen = ref(false)
const editingTemplate = ref<Template | null>(null)

const form = ref({
  name: '',
  description: '',
  is_public: false,
  items: [] as TemplateItem[],
})

const formError = ref('')
const formLoading = ref(false)

function openNew() {
  editingTemplate.value = null
  form.value = { name: '', description: '', is_public: false, items: [] }
  modalOpen.value = true
}

function openEdit(template: Template) {
  editingTemplate.value = template
  form.value = {
    name: template.name,
    description: template.description || '',
    is_public: template.is_public,
    items: template.items.map(i => ({ ...i })),
  }
  modalOpen.value = true
}

function addItem() {
  form.value.items.push({
    title: '',
    description: '',
    priority: '',
    order: form.value.items.length,
  })
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

function moveItem(index: number, direction: 'up' | 'down') {
  const items = form.value.items
  if (direction === 'up' && index > 0) {
    [items[index], items[index - 1]] = [items[index - 1], items[index]]
  } else if (direction === 'down' && index < items.length - 1) {
    [items[index], items[index + 1]] = [items[index + 1], items[index]]
  }
}

async function handleSave() {
  if (!form.value.name.trim()) {
    formError.value = 'Name is required'
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    const body = {
      name: form.value.name,
      description: form.value.description || null,
      is_public: form.value.is_public,
      items: form.value.items.map((item, index) => ({
        title: item.title,
        description: item.description || null,
        priority: item.priority || null,
        order: index,
      })).filter(item => item.title.trim()),
    }

    if (editingTemplate.value) {
      await request(`/api/v1/task-list-templates/${editingTemplate.value.id}`, {
        method: 'PUT',
        body,
      })
    } else {
      await request('/api/v1/task-list-templates', {
        method: 'POST',
        body,
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

async function handleDelete(template: Template) {
  await request(`/api/v1/task-list-templates/${template.id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Task List Templates</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Create
            reusable task list templates for events and projects</p>
        </div>
        <Button size="sm" @click="openNew">
          <Plus class="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else-if="!templates?.length"
        class="text-sm text-muted-foreground">
        No templates yet. Create one to get started.
      </div>

      <div v-else class="space-y-3">
        <div v-for="template in templates" :key="template.id"
          class="p-4 rounded-xl border border-border bg-card space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium">{{ template.name }}</p>
                <span
                  class="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe v-if="template.is_public" class="w-3 h-3" />
                  <Lock v-else class="w-3 h-3" />
                  {{ template.is_public ? 'Public' : 'Private' }}
                </span>
              </div>
              <p v-if="template.description"
                class="text-xs text-muted-foreground mt-0.5">{{
                  template.description }}</p>
              <p class="text-xs text-muted-foreground mt-1">{{
                template.items.length }} task{{ template.items.length
                  !== 1 ? 's' : '' }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                @click="openEdit(template)">
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button v-if="template.user_id === authStore.user?.id"
                class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
                @click="handleDelete(template)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Preview items -->
          <div v-if="template.items.length" class="space-y-1 pt-1">
            <div v-for="item in template.items.slice(0, 3)"
              :key="item.id"
              class="flex items-center gap-2 text-xs text-muted-foreground">
              <div
                class="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
              {{ item.title }}
            </div>
            <p v-if="template.items.length > 3"
              class="text-xs text-muted-foreground pl-3.5">
              +{{ template.items.length - 3 }} more
            </p>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <AppModal :open="modalOpen"
        :title="editingTemplate ? 'Edit Template' : 'New Template'"
        @update:open="modalOpen = $event">
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Name <span
                class="text-destructive">*</span></label>
            <input v-model="form.name" type="text"
              placeholder="e.g. Standard Gala Checklist"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Description</label>
            <textarea v-model="form.description" rows="2"
              placeholder="What is this template for?"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div class="flex items-center gap-2">
            <input id="is_public" v-model="form.is_public"
              type="checkbox" class="h-4 w-4 rounded border-input" />
            <label for="is_public" class="text-sm">Make this template
              public</label>
          </div>

          <!-- Items -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Tasks</label>
              <Button size="sm" variant="outline" @click="addItem">
                <Plus class="w-3.5 h-3.5 mr-1" />
                Add Task
              </Button>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="(item, index) in form.items" :key="index"
                class="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
                <div class="flex flex-col gap-0.5">
                  <button
                    class="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    :disabled="index === 0"
                    @click="moveItem(index, 'up')">
                    <ChevronUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    class="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    :disabled="index === form.items.length - 1"
                    @click="moveItem(index, 'down')">
                    <ChevronDown class="w-3.5 h-3.5" />
                  </button>
                </div>
                <input v-model="item.title" type="text"
                  placeholder="Task title"
                  class="flex-1 px-2 py-1 text-sm rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                <select v-model="item.priority"
                  class="px-2 py-1 text-xs rounded border border-input bg-background focus:outline-none">
                  <option value="">No priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  class="text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeItem(index)">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p v-if="!form.items.length"
              class="text-xs text-muted-foreground">No tasks yet. Add
              some above.</p>
          </div>

          <p v-if="formError" class="text-sm text-destructive">{{
            formError }}</p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline"
              @click="modalOpen = false">Cancel</Button>
            <Button :disabled="formLoading" @click="handleSave">
              <!-- {{ formLoading ? 'Saving...' : editingTemplate ? 'Save
              Changes' : 'Create Template' }} -->
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  </NuxtLayout>
</template>