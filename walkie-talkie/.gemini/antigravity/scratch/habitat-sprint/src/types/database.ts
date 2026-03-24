export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type SprintPhase = 'waiting' | 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'completed'

export interface Database {
    public: {
        Tables: {
            teams: {
                Row: {
                    id: string
                    name: string
                    password_hash: string
                    invite_code: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    password_hash: string
                    invite_code?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    password_hash?: string
                    invite_code?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            team_members: {
                Row: {
                    id: string
                    team_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    name?: string
                    created_at?: string
                }
            }
            task_progress: {
                Row: {
                    id: string
                    team_id: string
                    task_id: string
                    phase: SprintPhase
                    is_completed: boolean
                    content: string | null
                    ai_generated_content: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    team_id: string
                    task_id: string
                    phase: SprintPhase
                    is_completed?: boolean
                    content?: string | null
                    ai_generated_content?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    team_id?: string
                    task_id?: string
                    phase?: SprintPhase
                    is_completed?: boolean
                    content?: string | null
                    ai_generated_content?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            sprint_timer: {
                Row: {
                    id: string
                    status: 'stopped' | 'running' | 'paused'
                    duration_seconds: number
                    remaining_seconds: number
                    started_at: string | null
                    current_phase: SprintPhase
                    updated_at: string
                }
                Insert: {
                    id?: string
                    status?: 'stopped' | 'running' | 'paused'
                    duration_seconds?: number
                    remaining_seconds?: number
                    started_at?: string | null
                    current_phase?: SprintPhase
                    updated_at?: string
                }
                Update: {
                    id?: string
                    status?: 'stopped' | 'running' | 'paused'
                    duration_seconds?: number
                    remaining_seconds?: number
                    started_at?: string | null
                    current_phase?: SprintPhase
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    created_at?: string
                }
            }
            user_roles: {
                Row: {
                    id: string
                    user_id: string
                    role: 'admin' | 'participant'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    role: 'admin' | 'participant'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    role?: 'admin' | 'participant'
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            sprint_phase: SprintPhase
            app_role: 'admin' | 'participant'
            timer_status: 'stopped' | 'running' | 'paused'
        }
    }
}

export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TaskProgress = Database['public']['Tables']['task_progress']['Row']
export type SprintTimer = Database['public']['Tables']['sprint_timer']['Row']
