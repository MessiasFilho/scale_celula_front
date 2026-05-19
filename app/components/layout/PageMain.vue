<template>
  <main class="mx-auto max-w-6xl px-6 py-12">
    <p
      v-if="store.error"
      class="mb-8 border border-m-red/60 bg-surface-soft px-4 py-3 text-sm text-m-red"
      role="alert"
    >
      {{ store.error }}
    </p>
    <slot />
  </main>
</template>

<script setup lang="ts">
const store = useScaleStore()
</script>
