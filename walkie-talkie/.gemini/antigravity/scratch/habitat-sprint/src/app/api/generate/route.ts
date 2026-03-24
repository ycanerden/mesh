import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { type, context } = await request.json()

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            // Return mock content if no API key
            return NextResponse.json({
                content: getMockContent(type, context),
                type,
            })
        }

        const systemPrompts: Record<string, string> = {
            'mvp-scope': `You are an expert startup advisor helping founders scope their MVP.
Given the problem, solution, and target customer, generate a focused MVP scope that can be built in 90 minutes.
Focus on the ONE core feature that tests the main hypothesis.
Format as a clear, actionable scope document.`,

            'lovable-prompt': `You are an expert at writing prompts for Lovable (an AI app builder).
Given the startup context, write a detailed prompt that Lovable can use to build an MVP.
Include: app name, core feature, UI layout, user flow, and any integrations needed.
Make it specific enough that Lovable can build it without further questions.`,

            'target-customer': `You are a customer discovery expert.
Given the problem and solution, generate a detailed target customer profile including:
- Demographics
- Pain points
- Current solutions they use
- Where to find them
- Why they would care about this solution`,

            'outreach-messages': `You are an expert at cold outreach for early-stage startups.
Generate 3 variants of personal outreach messages for potential customers.
Each should be:
- Under 100 words
- Personal and conversational
- Ask for feedback, not a sale
- Include a specific ask (15-min call, try the prototype, etc.)`,
        }

        const systemPrompt = systemPrompts[type] || systemPrompts['mvp-scope']

        const userMessage = `
Problem: ${context.problem || 'Not specified'}
Solution: ${context.solution || 'Not specified'}
Target Customer: ${context.targetCustomer || 'Not specified'}
Team Name: ${context.teamName || 'Unknown'}

Please generate appropriate content based on the above context.
`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        })

        if (!response.ok) {
            throw new Error('OpenAI API error')
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content || 'Failed to generate content'

        return NextResponse.json({
            content,
            type,
        })
    } catch (error) {
        console.error('Generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        )
    }
}

function getMockContent(type: string, context: { teamName?: string; problem?: string; solution?: string }): string {
    const templates: Record<string, string> = {
        'mvp-scope': `# MVP Scope for ${context.teamName || 'Your Startup'}

## Core Hypothesis
Users will [action] because [value proposition].

## Must-Have Features (Build Tonight)
1. **Core Feature**: ${context.solution || 'Main feature description'}
2. **Simple Auth**: Email/password or magic link
3. **Basic UI**: One main screen that does the core action

## NOT Building Tonight
- Admin dashboard
- Payment integration
- Mobile app

## Success Criteria
A user can complete the core action end-to-end.`,

        'lovable-prompt': `Build me a web app called "${context.teamName || 'MyApp'}" with the following specs:

**Problem it solves**: ${context.problem || 'User problem'}
**Solution**: ${context.solution || 'App solution'}

**Core Features**:
- Landing page with clear value proposition
- Sign up form (email only)
- Main dashboard with the core feature
- Clean, modern UI with a blue/white color scheme

**User Flow**:
1. User lands on homepage
2. Signs up with email
3. Goes to dashboard
4. Uses the main feature
5. Sees results

Use Tailwind CSS for styling. Keep it simple and focused.`,

        'target-customer': `## Target Customer Profile

**Demographics**
- Age: 25-45
- Role: Startup founders, product managers
- Location: Urban tech hubs
- Income: $50k-150k

**Pain Points**
- ${context.problem || 'Main problem they experience'}
- Limited time to build and validate ideas
- Struggle to get early customer feedback

**Current Solutions**
- Spreadsheets and manual processes
- Generic tools not built for their use case
- Doing nothing (tolerating the pain)

**Where to Find Them**
- LinkedIn (startup/founder groups)
- Twitter/X (tech community)
- Local meetups and hackathons
- Product Hunt

**Why They'd Care**
${context.solution || 'Your solution'} saves them time and helps them validate faster.`,

        'outreach-messages': `## Outreach Message Variants

**Variant 1: The Helper**
"Hey [Name]! I noticed you're working on [their project]. I'm building something that might help with ${context.problem || 'this problem'} — would love to get your feedback. Any chance you'd have 15 mins for a quick call this week?"

**Variant 2: The Curious**
"Hi [Name], quick question: how do you currently handle ${context.problem || 'this challenge'}? Building a tool for this and trying to learn from folks like you. Would a 10-min chat work?"

**Variant 3: The MVP Share**
"[Name], just shipped a quick prototype that tackles ${context.problem || 'this problem'}. Would you mind taking a 2-min look and telling me if I'm on the right track? [Link]"`,
    }

    return templates[type] || templates['mvp-scope']
}
