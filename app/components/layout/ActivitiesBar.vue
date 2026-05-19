<template>
  <section class="border-b border-hairline py-6">
    <div class="mx-auto max-w-6xl px-6">
      <p class="label-uppercase mb-4">
        Atividades ({{ store.atividades.length }})
      </p>
      <p v-if="store.loading" class="text-sm font-light text-body">Carregando…</p>
      <div
        v-else-if="store.atividades.length"
        class="scrollbar-theme flex gap-4 overflow-x-auto pb-3"
      >
        <article
          v-for="atividade in store.atividades"
          :key="atividade.id"
          class="flex shrink-0 items-center gap-4 border border-hairline bg-surface-card px-5 py-3"
        >
          <p class="whitespace-nowrap font-bold uppercase text-on-dark">
            {{ atividade.name }}
          </p>
          <button
            type="button"
            class="icon-btn icon-btn-danger"
            aria-label="Remover atividade"
            @click="$emit('delete', atividade.id, atividade.name)"
          >
            <IconsIconTrash />
          </button>
        </article>
      </div>
      <p v-else class="text-sm font-light text-muted">
        Nenhuma atividade. Clique em &quot;Adicionar atividade&quot;.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  delete: [id: number, name: string]
}>()

const store = useScaleStore()
</script>
