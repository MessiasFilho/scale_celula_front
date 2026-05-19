<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
    >
      <div
        class="absolute inset-0 bg-black/85"
        aria-hidden="true"
        @click="onCancel"
      />
      <div
        class="relative z-10 w-full max-w-sm border border-hairline bg-surface-card"
        @click.stop
      >
        <MStripeDivider />
        <div class="px-6 py-6">
          <p class="label-uppercase mb-2">{{ eyebrow }}</p>
          <h2 :id="titleId" class="text-lg font-bold uppercase text-on-dark">
            {{ dialogTitle }}
          </h2>
          <p :id="messageId" class="mt-3 text-sm font-light text-body">
            {{ dialogMessage }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              class="btn-ghost"
              :disabled="loading"
              @click="onCancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              :class="confirmButtonClass"
              :disabled="loading"
              @click="onConfirm"
            >
              {{ loading ? 'Aguarde…' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { MemberAlertVariant } from '~/types/scale'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    variant: MemberAlertVariant
    memberName: string
    memberStatus?: string
    loading?: boolean
  }>(),
  {
    memberStatus: 'active',
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = `alert-title-${useId()}`
const messageId = `alert-message-${useId()}`

const eyebrow = computed(() => 'Confirmação')

const isDeactivating = computed(
  () => props.variant === 'toggle' && props.memberStatus === 'active',
)

const dialogTitle = computed(() => {
  if (props.variant === 'delete') return 'Excluir membro'
  if (props.variant === 'deleteAtividade') return 'Excluir atividade'
  if (props.variant === 'toggle') {
    return isDeactivating.value ? 'Desativar membro' : 'Ativar membro'
  }
  return 'Salvar alterações'
})

const dialogMessage = computed(() => {
  if (props.variant === 'delete') {
    return `Tem certeza que deseja excluir "${props.memberName}"? Esta ação não pode ser desfeita.`
  }
  if (props.variant === 'deleteAtividade') {
    return `Tem certeza que deseja excluir a atividade "${props.memberName}"? Esta ação não pode ser desfeita.`
  }
  if (props.variant === 'toggle') {
    return isDeactivating.value
      ? `Deseja desativar "${props.memberName}"? Membros inativos não entram na escala.`
      : `Deseja ativar "${props.memberName}"?`
  }
  return `Deseja salvar as alterações em "${props.memberName}"?`
})

const confirmLabel = computed(() => {
  if (props.variant === 'delete' || props.variant === 'deleteAtividade') return 'Excluir'
  if (props.variant === 'toggle') {
    return isDeactivating.value ? 'Desativar' : 'Ativar'
  }
  return 'Salvar'
})

const confirmButtonClass = computed(() => {
  if (props.variant === 'delete' || props.variant === 'deleteAtividade' || isDeactivating.value) {
    return 'btn-danger'
  }
  return 'btn-primary'
})

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function onConfirm() {
  emit('confirm')
}
</script>
