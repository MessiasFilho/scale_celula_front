<template>
  <div>
    <LayoutAppHeader title="Escalas salvas">
      <template #actions>
        <NuxtLink to="/" class="btn-ghost">
          Início
        </NuxtLink>
      </template>
    </LayoutAppHeader>

    <LayoutPageMain>
      <section>
        <div class="mb-6 border-b border-hairline pb-4">
          <p class="label-uppercase mb-1">Histórico</p>
          <p class="text-sm font-light text-body">
            Escalas confirmadas e salvas no banco de dados.
          </p>
        </div>

        <p v-if="store.loadingSavedScales" class="text-sm font-light text-body">
          Carregando…
        </p>

        <p
          v-else-if="!store.savedScales.length"
          class="border border-dashed border-hairline px-6 py-16 text-center text-sm font-light text-muted"
        >
          Nenhuma escala salva ainda. Gere e confirme uma escala na página inicial.
        </p>

        <div v-else class="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <p class="label-uppercase mb-3">Lista</p>
            <ul class="space-y-2">
              <li v-for="scale in store.savedScales" :key="scale.id">
                <button
                  type="button"
                  class="w-full border px-3 py-3 text-left text-sm transition-colors"
                  :class="
                    selectedId === scale.id
                      ? 'border-on-dark bg-surface-elevated text-on-dark'
                      : 'border-hairline bg-surface-soft text-body hover:border-on-dark hover:text-on-dark'
                  "
                  @click="selectedId = scale.id"
                >
                  <span class="label-uppercase block text-[10px]">Escala #{{ scale.id }}</span>
                  <span class="font-light">{{ formatDate(scale.created_at) }}</span>
                </button>
              </li>
            </ul>
          </aside>

          <div v-if="selectedScale" class="card-surface">
            <div class="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-4">
              <div>
                <p class="label-uppercase mb-1">Detalhes</p>
                <p class="text-sm font-light text-body">
                  {{ formatDate(selectedScale.created_at) }}
                </p>
              </div>
              <button
                type="button"
                class="btn-danger h-10 px-4 text-xs"
                :disabled="deleting"
                @click="onDelete"
              >
                {{ deleting ? 'Excluindo…' : 'Excluir escala' }}
              </button>
            </div>

            <ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <li
                v-for="item in selectedScale.scale_list"
                :key="item.id"
                class="border border-hairline bg-surface-soft px-4 py-3"
              >
                <p class="label-uppercase mb-2">{{ item.atividade.name }}</p>
                <MStripeDivider />
                <div class="mt-3">
                  <p class="font-bold uppercase text-on-dark">{{ item.member.name }}</p>
                  <p class="mt-1 text-sm font-light text-body">{{ item.member.fone || '—' }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </LayoutPageMain>
  </div>
</template>

<script setup lang="ts">
import type { ScaleListRecord } from '~/types/scale'

definePageMeta({
  layout: 'default',
})

const store = useScaleStore()
const selectedId = ref<number | null>(null)
const deleting = ref(false)

const selectedScale = computed<ScaleListRecord | null>(() =>
  store.savedScales.find((s) => s.id === selectedId.value) ?? null,
)

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR')
}

async function onDelete() {
  if (!selectedScale.value) return
  if (!confirm(`Excluir a escala #${selectedScale.value.id}?`)) return

  deleting.value = true
  const id = selectedScale.value.id
  const ok = await store.deleteSavedScale(id)
  deleting.value = false

  if (ok) {
    selectedId.value = store.savedScales[0]?.id ?? null
  }
}

onMounted(async () => {
  const ok = await store.fetchSavedScales()
  const firstScale = store.savedScales.at(0)
  if (ok && firstScale) {
    selectedId.value = firstScale.id
  }
})
</script>
