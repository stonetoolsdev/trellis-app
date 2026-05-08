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

interface InventoryItem {
  id: string
  name: string
  category: string | null
  quantity: number
  stock_status: string
  notes: string | null
  created_at: string
}

const { data: items, pending, refresh } = await useApi<InventoryItem[]>('/api/v1/inventory')

const request = useApiRequest()

const modalOpen = ref(false)
const editingItem = ref<InventoryItem | null>(null)

const form = ref({
  name: '',
  category: '',
  quantity: 0,
  stock_status: 'in_stock',
  notes: '',
})

const formError = ref('')
const formLoading = ref(false)

function openNew() {
  editingItem.value = null
  form.value = { name: '', category: '', quantity: 0, stock_status: 'in_stock', notes: '' }
  modalOpen.value = true
}

function openEdit(item: InventoryItem) {
  editingItem.value = item
  form.value = {
    name: item.name,
    category: item.category || '',
    quantity: item.quantity,
    stock_status: item.stock_status,
    notes: item.notes || '',
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
    if (editingItem.value) {
      await request(`/api/v1/inventory/${editingItem.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await request('/api/v1/inventory', {
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

async function handleDelete(item: InventoryItem) {
  await request(`/api/v1/inventory/${item.id}`, { method: 'DELETE' })
  refresh()
}

const stockStatusColors: Record<string, string> = {
  in_stock: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  low_stock: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

// Group items by category
const groupedItems = computed(() => {
  if (!items.value) return {}
  return (items.value as InventoryItem[]).reduce((acc, item) => {
    const cat = item.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)
})
</script>

<template>
  <NuxtLayout>
    <div class="p-10 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Inventory</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your
            organization's inventory</p>
        </div>
        <Button size="sm" @click="openNew">
          <Plus class="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div v-if="pending" class="text-sm text-muted-foreground">
        Loading...</div>

      <div v-else-if="!items?.length"
        class="text-sm text-muted-foreground">
        No inventory items yet.
      </div>

      <div v-else class="space-y-8">
        <div v-for="(categoryItems, category) in groupedItems"
          :key="category" class="space-y-3">
          <h2
            class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {{ category }}</h2>
          <div class="space-y-2">
            <div v-for="item in categoryItems" :key="item.id"
              class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{{ item.name }}</p>
                <p v-if="item.notes"
                  class="text-xs text-muted-foreground mt-0.5">{{
                    item.notes }}</p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm text-muted-foreground">Qty: {{
                  item.quantity }}</span>
                <span
                  :class="['text-xs px-2 py-0.5 rounded-full font-medium capitalize', stockStatusColors[item.stock_status]]">
                  {{ item.stock_status.replace('_', ' ') }}
                </span>
                <button
                  class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  @click="openEdit(item)">
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
                  @click="handleDelete(item)">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppModal :open="modalOpen"
        :title="editingItem ? 'Edit Item' : 'Add Item'"
        @update:open="modalOpen = $event">
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Name <span
                class="text-destructive">*</span></label>
            <input v-model="form.name" type="text"
              placeholder="e.g. Napkins"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Category</label>
            <input v-model="form.category" type="text"
              placeholder="e.g. Supplies"
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Quantity</label>
              <input v-model="form.quantity" type="number" min="0"
                class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Stock Status</label>
              <select v-model="form.stock_status"
                class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Notes</label>
            <textarea v-model="form.notes" rows="2"
              placeholder="Optional notes..."
              class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <p v-if="formError" class="text-sm text-destructive">{{
            formError }}</p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline"
              @click="modalOpen = false">Cancel</Button>
            <Button :disabled="formLoading" @click="handleSave">
              {{ formLoading ? 'Saving...' :
                editingItem ? 'Save Changes' : 'Add Item' }}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  </NuxtLayout>
</template>