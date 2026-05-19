<template>

  <UiAppDialog

    :model-value="modelValue"

    title="Confirmar escala"

    eyebrow="Pré-visualização"

    @update:model-value="onOpenChange"

  >

    <div class="mb-6 flex flex-wrap items-start justify-between gap-3">

      <p class="text-sm font-light text-body">

        Revise a distribuição abaixo. Ao confirmar, a escala será salva no banco de dados.

      </p>

      <button

        type="button"

        class="btn-ghost shrink-0"

        :disabled="loading || generating"

        @click="onRegenerate"

      >

        {{ generating ? 'Gerando…' : 'Gerar novamente' }}

      </button>

    </div>



    <ul

      class="scrollbar-theme max-h-[50vh] space-y-3 overflow-y-auto pr-1"

    >

      <li

        v-for="(item, index) in items"

        :key="`${item.atividade.id}-${item.member.id}-${index}`"

        class="border border-hairline bg-surface-soft px-4 py-3"

      >

        <p class="label-uppercase mb-1">{{ item.atividade.name }}</p>

        <p class="font-bold uppercase text-on-dark">{{ item.member.name }}</p>

        <p class="text-sm font-light text-body">{{ item.member.fone || '—' }}</p>

      </li>

    </ul>



    <div class="mt-8 flex flex-wrap gap-3 border-t border-hairline pt-6">

      <button

        type="button"

        class="btn-primary"

        :disabled="loading || generating || !items.length"

        @click="emit('confirm')"

      >

        {{ loading ? 'Salvando…' : 'Confirmar' }}

      </button>

      <button

        type="button"

        class="btn-ghost"

        :disabled="loading || generating"

        @click="onCancel"

      >

        Cancelar

      </button>

    </div>

  </UiAppDialog>

</template>



<script setup lang="ts">

import type { MemberAtividadeItem } from '~/types/scale'



defineProps<{

  modelValue: boolean

  items: MemberAtividadeItem[]

  loading?: boolean

  generating?: boolean

}>()



const emit = defineEmits<{

  'update:modelValue': [value: boolean]

  confirm: []

  cancel: []

  regenerate: []

}>()



function onRegenerate() {

  emit('regenerate')

}



function onOpenChange(open: boolean) {

  if (!open) emit('cancel')

  emit('update:modelValue', open)

}



function onCancel() {

  emit('cancel')

  emit('update:modelValue', false)

}

</script>

