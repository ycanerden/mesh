'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Team } from '@/types/database'

interface TeamAuthContextType {
    team: Team | null
    isLoading: boolean
    error: string | null
    isDemoMode: boolean
    login: (teamName: string, password: string) => Promise<boolean>
    signup: (teamName: string, password: string, memberNames?: string[]) => Promise<boolean>
    logout: () => void
}

const TeamAuthContext = createContext<TeamAuthContextType | undefined>(undefined)

// Simple hash function for password (in production, use server-side bcrypt)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Demo mode team storage
const DEMO_TEAMS_KEY = 'habitat-demo-teams'

function getDemoTeams(): Team[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(DEMO_TEAMS_KEY)
    return stored ? JSON.parse(stored) : []
}

function saveDemoTeam(team: Team): void {
    const teams = getDemoTeams()
    teams.push(team)
    localStorage.setItem(DEMO_TEAMS_KEY, JSON.stringify(teams))
}

export function TeamAuthProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()
    const isDemoMode = !isSupabaseConfigured

    useEffect(() => {
        // Check for existing session in sessionStorage
        const stored = sessionStorage.getItem('habitat-team')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setTeam(parsed)
            } catch {
                sessionStorage.removeItem('habitat-team')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (teamName: string, password: string): Promise<boolean> => {
        setError(null)
        setIsLoading(true)

        try {
            const hashedPassword = await hashPassword(password)

            if (isDemoMode) {
                // Demo mode: check localStorage
                const teams = getDemoTeams()
                const foundTeam = teams.find(
                    t => t.name === teamName && t.password_hash === hashedPassword
                )

                if (!foundTeam) {
                    setError('Invalid team name or password')
                    setIsLoading(false)
                    return false
                }

                setTeam(foundTeam)
                sessionStorage.setItem('habitat-team', JSON.stringify(foundTeam))
                setIsLoading(false)
                return true
            }

            // Supabase mode
            const { data, error: fetchError } = await supabase!
                .from('teams')
                .select('*')
                .eq('name', teamName)
                .eq('password_hash', hashedPassword)
                .single()

            if (fetchError || !data) {
                setError('Invalid team name or password')
                setIsLoading(false)
                return false
            }

            setTeam(data)
            sessionStorage.setItem('habitat-team', JSON.stringify(data))
            setIsLoading(false)
            return true
        } catch (err) {
            setError('An error occurred during login')
            setIsLoading(false)
            return false
        }
    }

    const signup = async (teamName: string, password: string, memberNames?: string[]): Promise<boolean> => {
        setError(null)
        setIsLoading(true)

        try {
            const hashedPassword = await hashPassword(password)
            const inviteCode = generateInviteCode()

            if (isDemoMode) {
                // Demo mode: use localStorage
                const teams = getDemoTeams()
                const existing = teams.find(t => t.name === teamName)

                if (existing) {
                    setError('Team name already taken')
                    setIsLoading(false)
                    return false
                }

                const newTeam: Team = {
                    id: crypto.randomUUID(),
                    name: teamName,
                    password_hash: hashedPassword,
                    invite_code: inviteCode,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }

                saveDemoTeam(newTeam)
                setTeam(newTeam)
                sessionStorage.setItem('habitat-team', JSON.stringify(newTeam))
                setIsLoading(false)
                return true
            }

            // Supabase mode
            // Check if team name already exists
            const { data: existing } = await supabase!
                .from('teams')
                .select('id')
                .eq('name', teamName)
                .single()

            if (existing) {
                setError('Team name already taken')
                setIsLoading(false)
                return false
            }

            const { data: newTeam, error: insertError } = await supabase!
                .from('teams')
                .insert({
                    name: teamName,
                    password_hash: hashedPassword,
                    invite_code: inviteCode,
                })
                .select()
                .single()

            if (insertError || !newTeam) {
                setError('Failed to create team')
                setIsLoading(false)
                return false
            }

            // Add team members if provided
            if (memberNames && memberNames.length > 0) {
                const membersToInsert = memberNames
                    .filter(name => name.trim())
                    .map(name => ({
                        team_id: newTeam.id,
                        name: name.trim(),
                    }))

                if (membersToInsert.length > 0) {
                    await supabase!.from('team_members').insert(membersToInsert)
                }
            }

            setTeam(newTeam)
            sessionStorage.setItem('habitat-team', JSON.stringify(newTeam))
            setIsLoading(false)
            return true
        } catch (err) {
            setError('An error occurred during signup')
            setIsLoading(false)
            return false
        }
    }

    const logout = () => {
        setTeam(null)
        sessionStorage.removeItem('habitat-team')
    }

    return (
        <TeamAuthContext.Provider value={{ team, isLoading, error, isDemoMode, login, signup, logout }}>
            {children}
        </TeamAuthContext.Provider>
    )
}

export function useTeamAuth() {
    const context = useContext(TeamAuthContext)
    if (context === undefined) {
        throw new Error('useTeamAuth must be used within a TeamAuthProvider')
    }
    return context
}
