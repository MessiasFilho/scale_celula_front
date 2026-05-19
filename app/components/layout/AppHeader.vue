<template>
  <header class="border-b border-hairline">
    <div class="mx-auto max-w-6xl px-6 py-5">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="label-uppercase mb-1">Scale Generate</p>
          <h1 class="text-3xl font-bold uppercase tracking-tight md:text-5xl">
            {{ title }}
          </h1>
        </div>
        <div class="flex flex-wrap gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
    <MStripeDivider />
    <slot name="extra" />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
