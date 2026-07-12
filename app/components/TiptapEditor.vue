<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: any
  placeholder?: string
  editable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const editor = useEditor({
  content: props.modelValue || '',
  editable: true,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'Start writing...',
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getJSON())
  },
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(() => props.modelValue, (val) => {
  if (editor.value && JSON.stringify(val) !== JSON.stringify(editor.value.getJSON())) {
    editor.value.commands.setContent(val || '')
  }
})

watch(() => props.editable, (val) => {
  editor.value?.setEditable(val !== false)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-1 p-2 border-b border-border flex-wrap">
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors font-bold', editor?.isActive('bold') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleBold().run()">B</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors italic', editor?.isActive('italic') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleItalic().run()">I</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors line-through', editor?.isActive('strike') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleStrike().run()">S</button>
      <div class="w-px h-4 bg-border mx-1" />
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('heading', { level: 1 }) ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('heading', { level: 2 }) ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('heading', { level: 3 }) ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <div class="w-px h-4 bg-border mx-1" />
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('bulletList') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleBulletList().run()">•
        List</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('orderedList') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleOrderedList().run()">1.
        List</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('blockquote') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleBlockquote().run()">❝</button>
      <button
        :class="['px-2 py-1 text-xs rounded hover:bg-accent transition-colors', editor?.isActive('codeBlock') ? 'bg-accent' : '']"
        @click="editor?.chain().focus().toggleCodeBlock().run()">{}</button>
      <div class="w-px h-4 bg-border mx-1" />
      <button
        class="px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
        @click="editor?.chain().focus().undo().run()">↩</button>
      <button
        class="px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
        @click="editor?.chain().focus().redo().run()">↪</button>
    </div>

    <EditorContent :editor="editor" class="tiptap-content" />
  </div>
</template>

<style>
.tiptap-content .ProseMirror {
  outline: none;
  padding: 1rem;
  min-height: 200px;
}

.tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
  color: var(--color-muted-foreground);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap-content .ProseMirror h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.tiptap-content .ProseMirror h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.tiptap-content .ProseMirror h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.tiptap-content .ProseMirror ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-content .ProseMirror ol {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.tiptap-content .ProseMirror blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-muted-foreground);
  margin: 0.5rem 0;
}

.tiptap-content .ProseMirror pre {
  background: var(--color-muted);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  margin: 0.5rem 0;
}

.tiptap-content .ProseMirror code {
  background: var(--color-muted);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>