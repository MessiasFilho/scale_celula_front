export interface Member {
  id: number
  name: string
  fone: string
  status: string
  created_at: string
  updated_at: string
}

export interface Atividade {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface MemberAtividadeItem {
  member: Member
  atividade: Atividade
}

export interface ApiListResponse<T> {
  data: T
}

export interface ApiMessageResponse {
  message: string
}

export type MemberAlertVariant = 'delete' | 'deleteAtividade' | 'save' | 'toggle'

export interface SaveScaleItemInput {
  member_id: number
  atividade_id: number
}

export interface SaveScaleResponse {
  message: string
  scale_id: number
}

export interface ScaleItemRecord {
  id: number
  scale_list_id: number
  member_id: number
  atividade_id: number
  member: Member
  atividade: Atividade
  created_at: string
  updated_at: string
}

export interface ScaleListRecord {
  id: number
  scale_list: ScaleItemRecord[]
  created_at: string
  updated_at: string
}
