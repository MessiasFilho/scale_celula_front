<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div
        class="absolute inset-0 bg-black/80"
        aria-hidden="true"
        @click="close"
      />
      <div
        class="relative z-10 flex w-full max-w-md flex-col border border-hairline bg-surface-card"
        @click.stop
      >
        <header class="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
          <div>
            <p v-if="eyebrow" class="label-uppercase mb-1">{{ eyebrow }}</p>
            <h2 :id="titleId" class="text-xl font-bold uppercase">
              {{ title }}
            </h2>
          </div>
          <button
            type="button"
            class="icon-btn"
            aria-label="Fechar"
            @click="close"
          >
            <span class="text-lg leading-none">×</span>
          </button>
        </header>
        <div class="px-6 py-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  eyebrow?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const titleId = `dialog-title-${useId()}`

function close() {
  emit('update:modelValue', false)
}
</script>
