import { defineStore } from 'pinia'
import type {
  ApiListResponse,
  Atividade,
  Member,
  MemberAtividadeItem,
  ScaleListRecord,
} from '~/types/scale'

export interface MemberForm {
  id?: number
  name: string
  fone: string
  status: string
}

export const useScaleStore = defineStore('scale', () => {
  const config = useRuntimeConfig()

  const members = ref<Member[]>([])
  const atividades = ref<Atividade[]>([])
  const generatedList = ref<MemberAtividadeItem[]>([])
  const pendingScale = ref<MemberAtividadeItem[]>([])
  const savedScales = ref<ScaleListRecord[]>([])

  const loading = ref(false)
  const generating = ref(false)
  const savingScale = ref(false)
  const loadingSavedScales = ref(false)
  const error = ref<string | null>(null)

  const memberForm = ref<MemberForm>({
    name: '',
    fone: '',
    status: 'active',
  })
  const atividadeForm = ref({ name: '' })

  const activeMembers = computed(() =>
    members.value.filter((m) => m.status === 'active'),
  )

  async function request<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
    return $fetch<T>(`${config.public.apiBase}${path}`, options)
  }

  function setError(message: string | null) {
    error.value = message
  }

  function getErrorMessage(e: unknown, fallback: string) {
    if (e && typeof e === 'object' && 'data' in e) {
      const data = (e as { data?: { error?: string } }).data
      if (data?.error) return data.error
    }
    if (e instanceof Error && e.message) return e.message
    return fallback
  }

  function resetMemberForm() {
    memberForm.value = { name: '', fone: '', status: 'active' }
  }

  function setMemberForm(member: Member | null) {
    if (member) {
      memberForm.value = {
        id: member.id,
        name: member.name,
        fone: member.fone,
        status: member.status,
      }
    } else {
      resetMemberForm()
    }
  }

  async function fetchMembers() {
    const res = await request<ApiListResponse<Member[]>>('/members')
    members.value = res.data
  }

  async function fetchAtividades() {
    const res = await request<ApiListResponse<Atividade[]>>('/atividades')
    atividades.value = res.data
  }

  async function loadAll() {
    loading.value = true
    setError(null)
    try {
      await Promise.all([fetchMembers(), fetchAtividades()])
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao carregar dados'))
    } finally {
      loading.value = false
    }
  }

  async function saveMember(): Promise<boolean> {
    if (!memberForm.value.name.trim()) {
      setError('Informe o nome do membro')
      return false
    }
    setError(null)
    try {
      if (memberForm.value.id) {
        await request(`/members/${memberForm.value.id}`, {
          method: 'PUT',
          body: {
            name: memberForm.value.name.trim(),
            fone: memberForm.value.fone.trim(),
            status: memberForm.value.status,
          },
        })
      } else {
        await request('/members', {
          method: 'POST',
          body: {
            name: memberForm.value.name.trim(),
            fone: memberForm.value.fone.trim(),
          },
        })
      }
      resetMemberForm()
      await fetchMembers()
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao salvar membro'))
      return false
    }
  }

  async function toggleMemberStatus(member: Member): Promise<boolean> {
    setError(null)
    const status = member.status === 'active' ? 'inactive' : 'active'
    try {
      await request(`/members/${member.id}`, {
        method: 'PUT',
        body: {
          name: member.name,
          fone: member.fone,
          status,
        },
      })
      await fetchMembers()
      generatedList.value = []
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao atualizar status do membro'))
      return false
    }
  }

  async function deleteMember(id: number): Promise<boolean> {
    setError(null)
    try {
      await request(`/members/${id}`, { method: 'DELETE' })
      await fetchMembers()
      generatedList.value = []
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao excluir membro'))
      return false
    }
  }

  async function createAtividade(): Promise<boolean> {
    if (!atividadeForm.value.name.trim()) {
      setError('Informe o nome da atividade')
      return false
    }
    setError(null)
    try {
      await request('/atividades', {
        method: 'POST',
        body: { name: atividadeForm.value.name.trim() },
      })
      atividadeForm.value = { name: '' }
      await fetchAtividades()
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao criar atividade'))
      return false
    }
  }

  async function deleteAtividade(id: number): Promise<boolean> {
    setError(null)
    try {
      await request(`/atividades/${id}`, { method: 'DELETE' })
      await fetchAtividades()
      generatedList.value = []
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao remover atividade'))
      return false
    }
  }

  async function generateList(): Promise<boolean> {
    generating.value = true
    setError(null)
    pendingScale.value = []
    try {
      const res = await request<ApiListResponse<MemberAtividadeItem[]>>(
        '/members/generate-list-menber',
      )
      pendingScale.value = res.data
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao gerar escala'))
      return false
    } finally {
      generating.value = false
    }
  }

  async function confirmScale(): Promise<boolean> {
    if (!pendingScale.value.length) {
      setError('Nenhuma escala para salvar')
      return false
    }
    savingScale.value = true
    setError(null)
    try {
      await request('/scale-lists', {
        method: 'POST',
        body: {
          items: pendingScale.value.map((item) => ({
            member_id: item.member.id,
            atividade_id: item.atividade.id,
          })),
        },
      })
      generatedList.value = [...pendingScale.value]
      pendingScale.value = []
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao salvar escala'))
      return false
    } finally {
      savingScale.value = false
    }
  }

  function cancelScale() {
    pendingScale.value = []
  }

  async function fetchSavedScales(): Promise<boolean> {
    loadingSavedScales.value = true
    setError(null)
    try {
      const res = await request<ApiListResponse<ScaleListRecord[]>>('/scale-lists')
      savedScales.value = res.data
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao carregar escalas salvas'))
      return false
    } finally {
      loadingSavedScales.value = false
    }
  }

  async function deleteSavedScale(id: number): Promise<boolean> {
    setError(null)
    try {
      await request(`/scale-lists/${id}`, { method: 'DELETE' })
      savedScales.value = savedScales.value.filter((s) => s.id !== id)
      return true
    } catch (e) {
      setError(getErrorMessage(e, 'Falha ao excluir escala'))
      return false
    }
  }

  return {
    members,
    atividades,
    generatedList,
    pendingScale,
    savedScales,
    loading,
    generating,
    savingScale,
    loadingSavedScales,
    error,
    setError,
    memberForm,
    atividadeForm,
    activeMembers,
    loadAll,
    resetMemberForm,
    setMemberForm,
    saveMember,
    toggleMemberStatus,
    deleteMember,
    createAtividade,
    deleteAtividade,
    generateList,
    confirmScale,
    cancelScale,
    fetchSavedScales,
    deleteSavedScale,
  }
})
