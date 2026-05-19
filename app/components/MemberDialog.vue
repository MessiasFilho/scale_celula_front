<template>
  <UiAppDialog
    :model-value="modelValue"
    :title="isEditing ? 'Editar membro' : 'Adicionar membro'"
    eyebrow="Membros"
    @update:model-value="onOpenChange"
  >
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label-uppercase mb-2 block" for="dialog-member-name">Nome</label>
        <input
          id="dialog-member-name"
          v-model="store.memberForm.name"
          type="text"
          class="input-dark"
          placeholder="Nome completo"
          autocomplete="name"
        />
      </div>
      <div>
        <label class="label-uppercase mb-2 block" for="dialog-member-fone">Telefone</label>
        <input
          id="dialog-member-fone"
          v-model="store.memberForm.fone"
          type="tel"
          class="input-dark"
          placeholder="(00) 00000-0000"
          autocomplete="tel"
        />
      </div>
      <div v-if="isEditing" class="flex items-center gap-3">
        <label class="label-uppercase shrink-0" for="dialog-member-status">Status</label>
        <select
          id="dialog-member-status"
          v-model="store.memberForm.status"
          class="input-dark h-10 flex-1"
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Salvando…' : isEditing ? 'Salvar' : 'Adicionar' }}
        </button>
        <button type="button" class="btn-ghost" @click="onOpenChange(false)">
          Cancelar
        </button>
      </div>
    </form>
  </UiAppDialog>

  <AlertsCompoenents
    v-model="saveAlertOpen"
    variant="save"
    :member-name="store.memberForm.name || member?.name || ''"
    :loading="saving"
    @confirm="onConfirmSave"
  />
</template>

<script setup lang="ts">
import type { Member } from '~/types/scale'

const props = defineProps<{
  modelValue: boolean
  member?: Member | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store = useScaleStore()
const saving = ref(false)
const saveAlertOpen = ref(false)

const isEditing = computed(() => !!props.member?.id)

watch(
  () => [props.modelValue, props.member] as const,
  ([open, member]) => {
    if (open) store.setMemberForm(member ?? null)
    if (!open) saveAlertOpen.value = false
  },
)

function onOpenChange(open: boolean) {
  if (!open) {
    store.resetMemberForm()
    saveAlertOpen.value = false
  }
  emit('update:modelValue', open)
}

function onSubmit() {
  if (!store.memberForm.name.trim()) {
    store.setError('Informe o nome do membro')
    return
  }

  if (isEditing.value) {
    saveAlertOpen.value = true
    return
  }

  void performSave()
}

async function onConfirmSave() {
  await performSave()
}

async function performSave() {
  saving.value = true
  const ok = await store.saveMember()
  saving.value = false
  if (ok) {
    saveAlertOpen.value = false
    emit('saved')
    onOpenChange(false)
  }
}
</script>
