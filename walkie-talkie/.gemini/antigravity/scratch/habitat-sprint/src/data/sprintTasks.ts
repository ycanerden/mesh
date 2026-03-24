import { SprintPhase } from '@/types/database'

export type TaskType = 'text' | 'textarea' | 'checkbox' | 'ai-generated' | 'url' | 'link-button'

export interface SprintTask {
    id: string
    title: string
    description?: string
    type: TaskType
    aiGeneratorType?: 'mvp-scope' | 'lovable-prompt' | 'target-customer' | 'outreach-messages'
    placeholder?: string
    required?: boolean
}

export interface Phase {
    id: SprintPhase
    number: number
    title: string
    description: string
    duration: string
    color: string
    tasks: SprintTask[]
}

export const SPRINT_PHASES: Phase[] = [
    {
        id: 'phase_1',
        number: 1,
        title: 'Idea & Business Model',
        description: 'Define your problem, solution, and target customer',
        duration: '60 min',
        color: '#3B82F6', // blue
        tasks: [
            {
                id: 'problem-statement',
                title: 'Problem Statement',
                description: 'Define the problem in 1-2 sentences. What pain point are you solving?',
                type: 'textarea',
                placeholder: 'People struggle with...',
                required: true,
            },
            {
                id: 'solution-description',
                title: 'Solution Description',
                description: 'How does your product solve this problem?',
                type: 'textarea',
                placeholder: 'Our solution...',
                required: true,
            },
            {
                id: 'target-customer',
                title: 'Target Customer',
                description: 'Who experiences this problem most acutely?',
                type: 'textarea',
                placeholder: 'Our target customer is...',
                required: true,
            },
            {
                id: 'unfair-advantage',
                title: 'Unfair Advantage',
                description: 'Why you vs competitors? What\'s hard to copy?',
                type: 'textarea',
                placeholder: 'We have an advantage because...',
                required: true,
            },
            {
                id: 'problem-validation',
                title: 'Problem Validation',
                description: 'List 2-3 pieces of evidence that this problem is real',
                type: 'textarea',
                placeholder: '1. Research shows...\n2. We interviewed...',
                required: true,
            },
            {
                id: 'success-metrics',
                title: 'Success Metrics',
                description: 'How will you measure success in 30 days?',
                type: 'textarea',
                placeholder: 'We will know we succeeded when...',
                required: true,
            },
        ],
    },
    {
        id: 'phase_2',
        number: 2,
        title: 'Build Prototype & Customer Discovery',
        description: 'Build your MVP and prepare for outreach',
        duration: '90 min',
        color: '#22C55E', // green
        tasks: [
            {
                id: 'mvp-prompt',
                title: 'MVP Prompt Generator',
                description: 'AI will generate a detailed Lovable prompt for your MVP',
                type: 'ai-generated',
                aiGeneratorType: 'lovable-prompt',
            },
            {
                id: 'mvp-url',
                title: 'Build & Deploy',
                description: 'Paste your live MVP URL here',
                type: 'url',
                placeholder: 'https://your-app.vercel.app',
            },
            {
                id: 'outreach-message',
                title: 'Outreach Message',
                description: 'Draft a personal outreach message for potential customers',
                type: 'ai-generated',
                aiGeneratorType: 'outreach-messages',
            },
            {
                id: 'contact-list',
                title: 'Contact List',
                description: 'Identify 5 specific people to reach out to',
                type: 'textarea',
                placeholder: '1. Name - Role - LinkedIn/Email\n2. ...',
            },
        ],
    },
    {
        id: 'phase_3',
        number: 3,
        title: 'Demo & Pitch',
        description: 'Prepare and deliver your demo',
        duration: '20 min',
        color: '#A855F7', // purple
        tasks: [
            {
                id: 'pitch-script',
                title: '30-Second Pitch',
                description: 'Write your demo talking points',
                type: 'textarea',
                placeholder: 'Problem: ...\nSolution: ...\nDemo: ...',
            },
            {
                id: 'demo-checklist',
                title: 'Demo Test Checklist',
                description: 'Verify your app works before presenting',
                type: 'checkbox',
            },
            {
                id: 'demo-completed',
                title: 'Demo to Group',
                description: 'Mark when you\'ve presented to the group',
                type: 'checkbox',
            },
        ],
    },
    {
        id: 'phase_4',
        number: 4,
        title: 'Extra Mile (Optional)',
        description: 'Post-event tasks to maximize momentum',
        duration: 'After event',
        color: '#F97316', // orange
        tasks: [
            {
                id: 'landing-page',
                title: 'Landing Page',
                description: 'Create a landing page for your product',
                type: 'checkbox',
            },
            {
                id: 'social-launch',
                title: 'Social Media Launch Post',
                description: 'Post about your launch on LinkedIn/Twitter',
                type: 'checkbox',
            },
            {
                id: 'domain-setup',
                title: 'Domain Registration',
                description: 'Register a domain for your product',
                type: 'checkbox',
            },
            {
                id: 'analytics-setup',
                title: 'Analytics Setup',
                description: 'Add analytics to track user behavior',
                type: 'checkbox',
            },
            {
                id: 'actual-outreach',
                title: 'Send Outreach Messages',
                description: 'Actually reach out to your contact list',
                type: 'checkbox',
            },
            {
                id: 'community-share',
                title: 'Share in Community',
                description: 'Share your project in Habitat community',
                type: 'checkbox',
            },
        ],
    },
]

export function getPhaseById(phaseId: SprintPhase): Phase | undefined {
    return SPRINT_PHASES.find(p => p.id === phaseId)
}

export function getTaskById(taskId: string): SprintTask | undefined {
    for (const phase of SPRINT_PHASES) {
        const task = phase.tasks.find(t => t.id === taskId)
        if (task) return task
    }
    return undefined
}
