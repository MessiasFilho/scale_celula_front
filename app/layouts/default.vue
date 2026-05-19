<template>
  <div class="min-h-screen bg-canvas">
    <slot />
    <footer class="border-t border-hairline py-10">
      <div class="mx-auto max-w-6xl px-6">
        <MStripeDivider />
        <p class="mt-6 text-xs font-light text-muted">
          Scale Generate — distribuição aleatória de membros por atividade.
        </p>
      </div>
    </footer>
  </div>
</template>
