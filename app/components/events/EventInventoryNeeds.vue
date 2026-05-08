<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  eventId: string
  inventory: {
    id: string
    inventory_item: { id: string, name: string } | null
    quantity_needed: number
    notes: string | null
    other_description: string | null
  }[]
}>()

const emit = defineEmits<{ 'refresh': [] }>()

const request = useApiRequest()

const { data: items } = await useApi<{ id: string, name: string, category: string | null }[]>('/api/v1/inventory')

const adding = ref(false)
const form = ref({
  inventory_item_id: '',
  quantity_needed: 1,
  notes: '',
  other_description: '',
})

async function handleAdd() {
  await request(`/api/v1/events/${props.eventId}/inventory`, {
    method: 'POST',
    body: {
      inventory_item_id: form.value.inventory_item_id === 'other' ? null : form.value.inventory_item_id || null,
      quantity_needed: form.value.quantity_needed,
      notes: form.value.notes || null,
      other_description: form.value.other_description || null,
    },
  })
  form.value = { inventory_item_id: '', quantity_needed: 1, notes: '', other_description: '' }
  adding.value = false
  emit('refresh')
}

async function handleDelete(itemId: string) {
  await request(`/api/v1/events/${props.eventId}/inventory/${itemId}`, {
    method: 'DELETE',
  })
  emit('refresh')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Items Needed</h2>
      <Button size="sm" variant="outline" @click="adding = !adding">
        <Plus class="w-4 h-4 mr-1" />
        Add Item
      </Button>
    </div>

    <!-- Add form -->
    <div v-if="adding"
      class="p-4 rounded-xl border border-border bg-card space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground">Item</label>
          <select v-model="form.inventory_item_id"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select item...</option>
            <option v-for="item in items" :key="item.id"
              :value="item.id">{{ item.name }}</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-muted-foreground">Quantity
            Needed</label>
          <input v-model="form.quantity_needed" type="number" min="1"
            class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div v-if="form.inventory_item_id === 'other'"
        class="space-y-1.5">
        <label
          class="text-xs font-medium text-muted-foreground">Describe
          the item</label>
        <input v-model="form.other_description" type="text"
          placeholder="e.g. Custom banners"
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="space-y-1.5">
        <label
          class="text-xs font-medium text-muted-foreground">Notes</label>
        <input v-model="form.notes" type="text"
          placeholder="Optional notes..."
          class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="flex gap-2 justify-end">
        <Button size="sm" variant="ghost"
          @click="adding = false">Cancel</Button>
        <Button size="sm" @click="handleAdd">Add Item</Button>
      </div>
    </div>

    <!-- Items list -->
    <div v-if="!inventory?.length && !adding"
      class="text-sm text-muted-foreground">
      No items needed yet.
    </div>

    <div class="space-y-2">
      <div v-for="item in inventory" :key="item.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">
            {{ item.inventory_item?.name || item.other_description ||
            'Unknown item' }}
          </p>
          <p class="text-xs text-muted-foreground">
            Qty needed: {{ item.quantity_needed }}
            <span v-if="item.notes"> · {{ item.notes }}</span>
          </p>
        </div>
        <button
          class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
          @click="handleDelete(item.id)">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>