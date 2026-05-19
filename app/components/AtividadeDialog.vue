<template>
  <UiAppDialog
    :model-value="modelValue"
    title="Adicionar atividade"
    eyebrow="Atividades"
    @update:model-value="onOpenChange"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label-uppercase mb-2 block" for="dialog-atividade-name">Atividade</label>
        <input
          id="dialog-atividade-name"
          v-model="store.atividadeForm.name"
          type="text"
          class="input-dark"
          placeholder="Ex.: Louvor, Recepção…"
        />
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Adicionar' }}
        </button>
        <button type="button" class="btn-ghost" @click="onOpenChange(false)">
          Cancelar
        </button>
      </div>
    </form>
  </UiAppDialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store = useScaleStore()
const saving = ref(false)

function onOpenChange(open: boolean) {
  if (!open) store.atividadeForm.name = ''
  emit('update:modelValue', open)
}

async function onSubmit() {
  saving.value = true
  const ok = await store.createAtividade()
  saving.value = false
  if (ok) {
    emit('saved')
    onOpenChange(false)
  }
}
</script>
