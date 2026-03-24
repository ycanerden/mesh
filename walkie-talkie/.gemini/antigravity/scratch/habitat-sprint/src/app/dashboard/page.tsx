'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTeamAuth } from '@/contexts/TeamAuthContext'
import { SPRINT_PHASES, Phase, SprintTask } from '@/data/sprintTasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { LogOut, Timer, CheckCircle2, Circle, Sparkles, ExternalLink, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TaskState {
    [taskId: string]: {
        completed: boolean
        content: string
        aiContent?: string
    }
}

// Demo mode storage
const DEMO_TASKS_KEY = 'habitat-demo-tasks'

function getDemoTasks(teamId: string): TaskState {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem(`${DEMO_TASKS_KEY}-${teamId}`)
    return stored ? JSON.parse(stored) : {}
}

function saveDemoTasks(teamId: string, tasks: TaskState): void {
    localStorage.setItem(`${DEMO_TASKS_KEY}-${teamId}`, JSON.stringify(tasks))
}

export default function DashboardPage() {
    const router = useRouter()
    const { team, isLoading: authLoading, logout, isDemoMode } = useTeamAuth()
    const [activePhase, setActivePhase] = useState<number>(0)
    const [taskState, setTaskState] = useState<TaskState>({})
    const [isLoading, setIsLoading] = useState(true)
    const [generatingFor, setGeneratingFor] = useState<string | null>(null)

    const supabase = createClient()

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !team) {
            router.push('/signup')
        }
    }, [authLoading, team, router])

    // Load task progress
    useEffect(() => {
        if (!team) return

        const loadProgress = async () => {
            if (isDemoMode) {
                // Demo mode: load from localStorage
                const demoTasks = getDemoTasks(team.id)
                setTaskState(demoTasks)
                setIsLoading(false)
                return
            }

            // Supabase mode
            const { data, error } = await supabase!
                .from('task_progress')
                .select('*')
                .eq('team_id', team.id)

            if (!error && data) {
                const state: TaskState = {}
                data.forEach(item => {
                    state[item.task_id] = {
                        completed: item.is_completed,
                        content: item.content || '',
                        aiContent: item.ai_generated_content ? JSON.stringify(item.ai_generated_content) : undefined,
                    }
                })
                setTaskState(state)
            }
            setIsLoading(false)
        }

        loadProgress()
    }, [team, supabase, isDemoMode])

    const saveTask = async (taskId: string, phase: string, updates: Partial<TaskState[string]>) => {
        if (!team) return

        const newState = {
            ...taskState[taskId],
            ...updates,
        }

        // Optimistic update
        const updatedTasks = {
            ...taskState,
            [taskId]: newState,
        }
        setTaskState(updatedTasks)

        if (isDemoMode) {
            // Demo mode: save to localStorage
            saveDemoTasks(team.id, updatedTasks)
            return
        }

        // Supabase mode
        const { error } = await supabase!
            .from('task_progress')
            .upsert({
                team_id: team.id,
                task_id: taskId,
                phase: phase,
                is_completed: newState.completed || false,
                content: newState.content || null,
                ai_generated_content: newState.aiContent ? JSON.parse(newState.aiContent) : null,
            }, {
                onConflict: 'team_id,task_id',
            })

        if (error) {
            toast.error('Failed to save progress')
            // Rollback
            setTaskState(prev => ({
                ...prev,
                [taskId]: taskState[taskId],
            }))
        }
    }

    const generateAIContent = async (task: SprintTask, phase: Phase) => {
        if (!team || !task.aiGeneratorType) return

        setGeneratingFor(task.id)

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: task.aiGeneratorType,
                    context: {
                        teamName: team.name,
                        problem: taskState['problem-statement']?.content || '',
                        solution: taskState['solution-description']?.content || '',
                        targetCustomer: taskState['target-customer']?.content || '',
                    },
                }),
            })

            if (!response.ok) throw new Error('Generation failed')

            const data = await response.json()

            await saveTask(task.id, phase.id, {
                content: data.content,
                aiContent: JSON.stringify(data),
                completed: true,
            })

            toast.success('Content generated!')
        } catch (error) {
            toast.error('Failed to generate content.')
        } finally {
            setGeneratingFor(null)
        }
    }

    const calculateProgress = () => {
        let completed = 0
        let total = 0
        SPRINT_PHASES.forEach(phase => {
            phase.tasks.forEach(task => {
                total++
                if (taskState[task.id]?.completed) completed++
            })
        })
        return total > 0 ? (completed / total) * 100 : 0
    }

    const handleLogout = () => {
        logout()
        router.push('/signup')
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        )
    }

    if (!team) return null

    const currentPhase = SPRINT_PHASES[activePhase]
    const progress = calculateProgress()

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-slate-900">{team.name}</h1>
                                <p className="text-xs text-slate-500">HABITAT Sprint</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {isDemoMode && (
                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    <AlertCircle className="w-3 h-3" />
                                    Demo Mode
                                </div>
                            )}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <Timer className="w-4 h-4" />
                                <span className="font-mono">4:00:00</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                        <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Phase Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {SPRINT_PHASES.map((phase, index) => {
                        const phaseCompleted = phase.tasks.every(t => taskState[t.id]?.completed)
                        const phaseStarted = phase.tasks.some(t => taskState[t.id]?.completed || taskState[t.id]?.content)

                        return (
                            <button
                                key={phase.id}
                                onClick={() => setActivePhase(index)}
                                className={cn(
                                    "flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    activePhase === index
                                        ? "bg-white shadow-md text-slate-900 ring-2 ring-blue-500"
                                        : phaseCompleted
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : phaseStarted
                                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {phaseCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Circle className="w-4 h-4" style={{ color: phase.color }} />
                                    )}
                                    <span>Phase {phase.number}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Phase Content */}
                <div className="grid gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: currentPhase.color }}
                                >
                                    {currentPhase.number}
                                </div>
                                <div>
                                    <CardTitle>{currentPhase.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        {currentPhase.description}
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                            {currentPhase.duration}
                                        </span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {currentPhase.tasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        phase={currentPhase}
                                        state={taskState[task.id] || { completed: false, content: '' }}
                                        isGenerating={generatingFor === task.id}
                                        onSave={(updates) => saveTask(task.id, currentPhase.id, updates)}
                                        onGenerate={() => generateAIContent(task, currentPhase)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

interface TaskItemProps {
    task: SprintTask
    phase: Phase
    state: {
        completed: boolean
        content: string
        aiContent?: string
    }
    isGenerating: boolean
    onSave: (updates: Partial<{ completed: boolean; content: string; aiContent?: string }>) => void
    onGenerate: () => void
}

function TaskItem({ task, phase, state, isGenerating, onSave, onGenerate }: TaskItemProps) {
    const [localContent, setLocalContent] = useState(state.content)

    // Sync local content with state
    useEffect(() => {
        setLocalContent(state.content)
    }, [state.content])

    const handleContentBlur = () => {
        if (localContent !== state.content) {
            onSave({ content: localContent })
        }
    }

    if (task.type === 'checkbox') {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <Checkbox
                    id={task.id}
                    checked={state.completed}
                    onCheckedChange={(checked) => onSave({ completed: checked as boolean })}
                    className="mt-1"
                />
                <div className="flex-1">
                    <label htmlFor={task.id} className="font-medium text-slate-900 cursor-pointer">
                        {task.title}
                    </label>
                    {task.description && (
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    )}
                </div>
                {state.completed && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
            </div>
        )
    }

    if (task.type === 'ai-generated') {
        return (
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <h4 className="font-medium text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin mr-2">⚡</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                            </>
                        )}
                    </Button>
                </div>
                {state.content && (
                    <Textarea
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        onBlur={handleContentBlur}
                        className="min-h-[120px] mt-2"
                    />
                )}
            </div>
        )
    }

    if (task.type === 'url') {
        return (
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
                {task.description && (
                    <p className="text-sm text-slate-500 mb-3">{task.description}</p>
                )}
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder={task.placeholder}
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        onBlur={handleContentBlur}
                        className="flex-1"
                    />
                    {state.content && (
                        <Button variant="outline" size="icon" asChild>
                            <a href={state.content} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // Default: textarea
    return (
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
            {task.description && (
                <p className="text-sm text-slate-500 mb-3">{task.description}</p>
            )}
            <Textarea
                placeholder={task.placeholder}
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={handleContentBlur}
                className="min-h-[100px]"
            />
            {state.content && !state.completed && (
                <div className="flex justify-end mt-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSave({ completed: true })}
                        className="text-green-600 hover:text-green-700"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                    </Button>
                </div>
            )}
        </div>
    )
}
