<template>
  <div>
    <LayoutAppHeader title="Escala da célula">
      <template #actions>
        <button type="button" class="btn-ghost" @click="openMemberDialog()">
          Adicionar membro
        </button>
        <button type="button" class="btn-ghost" @click="atividadeDialogOpen = true">
          Adicionar atividade
        </button>
        <NuxtLink to="/scales" class="btn-ghost">
          Escalas salvas
        </NuxtLink>
        <button
          type="button"
          class="btn-primary"
          :disabled="store.generating || store.atividades.length === 0"
          @click="onGenerateScale"
        >
          {{ store.generating ? 'Gerando…' : 'Gerar escala' }}
        </button>
      </template>
      <template #extra>
        <LayoutActivitiesBar @delete="onDeleteAtividade" />
      </template>
    </LayoutAppHeader>

    <LayoutPageMain>
      <section class="mb-16">
        <div class="mb-6 flex items-end justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <p class="label-uppercase mb-1">Equipe</p>
            <h2 class="text-2xl font-bold uppercase">Membros</h2>
          </div>
          <p class="text-sm font-light text-body">
            {{ store.activeMembers.length }} ativos / {{ store.members.length }} total
          </p>
        </div>

        <p v-if="store.loading" class="text-sm font-light text-body">Carregando…</p>
        <ul v-else-if="store.members.length" class="space-y-3">
          <li
            v-for="member in store.members"
            :key="member.id"
            class="flex items-center justify-between gap-4 border border-hairline bg-surface-soft px-4 py-3"
          >
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="font-bold text-on-dark">{{ member.name }}</p>
                <span
                  class="status-badge"
                  :class="
                    member.status === 'active'
                      ? 'status-badge--active text-blue-400'
                      : 'status-badge--inactive text-red-600'
                  "
                >
                  {{ member.status === 'active' ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <p class="text-sm font-light text-body">{{ member.fone || '—' }}</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="icon-btn"
                aria-label="Editar membro"
                @click="openMemberDialog(member)"
              >
                <IconsIconPencil />
              </button>
              <button
                type="button"
                class="icon-btn"
                :class="member.status !== 'active' ? 'border-on-dark text-on-dark' : ''"
                :aria-label="member.status === 'active' ? 'Desativar membro' : 'Ativar membro'"
                @click="openToggleAlert(member)"
              >
                <IconsIconToggle />
              </button>
              <button
                type="button"
                class="icon-btn icon-btn-danger"
                aria-label="Excluir membro"
                @click="openDeleteAlert(member)"
              >
                <IconsIconTrash />
              </button>
            </div>
          </li>
        </ul>
        <p
          v-else
          class="border border-dashed border-hairline px-6 py-12 text-center text-sm font-light text-muted"
        >
          Nenhum membro cadastrado. Clique em &quot;Adicionar membro&quot;.
        </p>
      </section>

      <section v-if="store.generatedList.length" class="mb-16">
        <div class="mb-8 flex items-end justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p class="label-uppercase mb-2">Resultado</p>
            <h2 class="text-2xl font-bold uppercase md:text-4xl">Escala gerada</h2>
          </div>
          <button type="button" class="btn-ghost" @click="onGenerateScale">
            Gerar novamente
          </button>
        </div>

        <ul class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <li
            v-for="(item, index) in store.generatedList"
            :key="`${item.atividade.id}-${item.member.id}-${index}`"
            class="card-surface"
          >
            <p class="label-uppercase mb-3">{{ item.atividade.name }}</p>
            <MStripeDivider />
            <div class="mt-4">
              <p class="text-lg font-bold uppercase text-on-dark">{{ item.member.name }}</p>
              <p class="mt-1 text-sm font-light text-body">{{ item.member.fone || '—' }}</p>
            </div>
          </li>
        </ul>
      </section>

      <section
        v-else-if="!store.loading"
        class="border border-dashed border-hairline px-6 py-16 text-center"
      >
        <p class="label-uppercase mb-3">Pronto para gerar</p>
        <p class="mx-auto max-w-md text-sm font-light text-body">
          Cadastre membros ativos e atividades, depois clique em
          <span class="text-on-dark">Gerar escala</span>
          para sortear um membro por atividade.
        </p>
      </section>
    </LayoutPageMain>

    <MemberDialog
      v-model="memberDialogOpen"
      :member="editingMember"
      @saved="store.setError(null)"
    />
    <AtividadeDialog
      v-model="atividadeDialogOpen"
      @saved="store.setError(null)"
    />
    <AlertsCompoenents
      v-model="memberAlertOpen"
      :variant="memberAlertVariant"
      :member-name="memberAlertTarget?.name ?? ''"
      :member-status="memberAlertTarget?.status ?? 'active'"
      :loading="memberAlertLoading"
      @confirm="onMemberAlertConfirm"
      @cancel="memberAlertTarget = null"
    />
    <AlertsCompoenents
      v-model="atividadeAlertOpen"
      variant="deleteAtividade"
      :member-name="atividadeAlertTarget?.name ?? ''"
      :loading="atividadeAlertLoading"
      @confirm="onAtividadeAlertConfirm"
      @cancel="atividadeAlertTarget = null"
    />
    <ScalePreviewDialog
      v-model="scalePreviewOpen"
      :items="store.pendingScale"
      :loading="store.savingScale"
      :generating="store.generating"
      @confirm="onConfirmScale"
      @cancel="onCancelScale"
      @regenerate="onRegenerateScale"
    />
  </div>
</template>

<script setup lang="ts">
import type { Member, MemberAlertVariant } from '~/types/scale'

definePageMeta({
  layout: 'default',
})

const store = useScaleStore()

const memberDialogOpen = ref(false)
const atividadeDialogOpen = ref(false)
const editingMember = ref<Member | null>(null)

const memberAlertOpen = ref(false)
const memberAlertVariant = ref<MemberAlertVariant>('delete')
const memberAlertTarget = ref<Member | null>(null)
const memberAlertLoading = ref(false)
const atividadeAlertOpen = ref(false)
const atividadeAlertTarget = ref<{ id: number; name: string } | null>(null)
const atividadeAlertLoading = ref(false)
const scalePreviewOpen = ref(false)

async function onGenerateScale() {
  const ok = await store.generateList()
  if (ok && store.pendingScale.length) scalePreviewOpen.value = true
}

async function onConfirmScale() {
  const ok = await store.confirmScale()
  if (ok) {
    scalePreviewOpen.value = false
    store.setError(null)
  }
}

async function onRegenerateScale() {
  await store.generateList()
}

function onCancelScale() {
  store.cancelScale()
  scalePreviewOpen.value = false
}

function openMemberDialog(member?: Member) {
  editingMember.value = member ?? null
  memberDialogOpen.value = true
}

function openToggleAlert(member: Member) {
  memberAlertTarget.value = member
  memberAlertVariant.value = 'toggle'
  memberAlertOpen.value = true
}

function openDeleteAlert(member: Member) {
  memberAlertTarget.value = member
  memberAlertVariant.value = 'delete'
  memberAlertOpen.value = true
}

async function onMemberAlertConfirm() {
  const member = memberAlertTarget.value
  if (!member) return

  memberAlertLoading.value = true
  const ok =
    memberAlertVariant.value === 'toggle'
      ? await store.toggleMemberStatus(member)
      : await store.deleteMember(member.id)
  memberAlertLoading.value = false
  if (ok) {
    memberAlertOpen.value = false
    memberAlertTarget.value = null
  }
}

function onDeleteAtividade(id: number, name: string) {
  atividadeAlertTarget.value = { id, name }
  atividadeAlertOpen.value = true
}

async function onAtividadeAlertConfirm() {
  const atividade = atividadeAlertTarget.value
  if (!atividade) return

  atividadeAlertLoading.value = true
  const ok = await store.deleteAtividade(atividade.id)
  atividadeAlertLoading.value = false
  if (ok) {
    atividadeAlertOpen.value = false
    atividadeAlertTarget.value = null
  }
}

onMounted(() => {
  store.loadAll()
})
</script>
