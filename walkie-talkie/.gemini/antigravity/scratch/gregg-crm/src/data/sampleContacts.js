// Sample contacts for first-run experience
export const sampleContacts = [
    {
        id: 'sarah-chen',
        frontmatter: {
            name: 'Sarah Chen',
            email: 'sarah@sequoia.com',
            company: 'Sequoia Capital',
            role: 'Partner',
            tags: ['investor', 'series-a'],
            phone: '+1-650-555-0142',
            linkedin: 'https://linkedin.com/in/sarahchen',
            status: 'warm',
            last_contacted: '2026-03-01',
            created: '2026-01-15',
        },
        body: `## Notes
Met at YC Demo Day W26. Showed genuine interest in what we're building — asked about our agent architecture and retention metrics. She's focused on developer tools and AI infrastructure.

Prefers async communication. Responds fast on email, not so much on LinkedIn.

## Activity
- **2026-03-01** — Sent monthly product update with new MCP integration numbers
- **2026-02-18** — 30-min Zoom call. Discussed Series A timeline, she wants to see $50k MRR
- **2026-02-02** — Shared deck v3 with updated metrics
- **2026-01-15** — Met at YC Demo Day, exchanged contacts`,
    },
    {
        id: 'marcus-johnson',
        frontmatter: {
            name: 'Marcus Johnson',
            email: 'marcus@copilotlabs.io',
            company: 'Copilot Labs',
            role: 'Co-founder & CEO',
            tags: ['founder', 'potential-partner'],
            phone: '+1-415-555-0198',
            linkedin: 'https://linkedin.com/in/marcusjohnson',
            status: 'hot',
            last_contacted: '2026-03-03',
            created: '2026-02-10',
        },
        body: `## Notes
Building an AI coding assistant, similar space. Potential partnership on shared MCP connectors — his team has a great Gmail integration we could use.

Really sharp technical founder. Stanford CS, ex-Google. No-bullshit communicator.

## Activity
- **2026-03-03** — Call about MCP connector partnership. He's in. Setting up a shared repo
- **2026-02-25** — Coffee at Sightglass. Talked about open-source go-to-market strategy
- **2026-02-10** — Connected via mutual friend (Jake at a16z)`,
    },
    {
        id: 'emma-rodriguez',
        frontmatter: {
            name: 'Emma Rodriguez',
            email: 'emma@techcrunch.com',
            company: 'TechCrunch',
            role: 'Senior Reporter',
            tags: ['press', 'ai-beat'],
            linkedin: 'https://linkedin.com/in/emmarodriguez',
            status: 'new',
            last_contacted: '2026-02-28',
            created: '2026-02-28',
        },
        body: `## Notes
Covers AI tools and developer infrastructure for TechCrunch. Interested in writing about local-first AI tools — she reached out after seeing our GitHub repo trending.

Wants to do a profile when we launch publicly. Need to prep talking points about open-source CRM + agent architecture.

## Activity
- **2026-02-28** — She DM'd on Twitter about writing a piece. Sent her a brief overview and offered a call`,
    },
    {
        id: 'david-kim',
        frontmatter: {
            name: 'David Kim',
            email: 'david@advisory.group',
            company: 'Kim Advisory',
            role: 'Startup Advisor',
            tags: ['advisor', 'go-to-market'],
            phone: '+1-212-555-0167',
            linkedin: 'https://linkedin.com/in/davidkim',
            status: 'warm',
            last_contacted: '2026-02-20',
            created: '2025-12-01',
        },
        body: `## Notes
Former VP Marketing at Notion. Now advises startups on GTM, especially open-source / PLG. Has been incredibly generous with his time.

Recommended the "post on HN first, GitHub stars as top-of-funnel" playbook. Helped refine our positioning.

## Activity
- **2026-02-20** — Monthly check-in. Reviewed our launch plan, suggested targeting r/selfhosted
- **2026-01-15** — Workshop session on positioning: "Your contacts are markdown. Your agent does the work."
- **2025-12-01** — Intro via YC Alumni network. First call about GTM strategy`,
    },
    {
        id: 'lisa-park',
        frontmatter: {
            name: 'Lisa Park',
            email: 'lisa@stripe.com',
            company: 'Stripe',
            role: 'Engineering Manager',
            tags: ['technical', 'potential-customer'],
            linkedin: 'https://linkedin.com/in/lisapark',
            status: 'cold',
            last_contacted: '2026-01-10',
            created: '2025-11-20',
        },
        body: `## Notes
Manages the developer experience team at Stripe. Interested in using our tool internally for managing partner relationships. Could be a great design partner.

Haven't followed up in a while — should re-engage with our latest product update.

## Activity
- **2026-01-10** — Sent product update, no response
- **2025-12-15** — Short demo call. Liked the markdown-based approach but wanted team features
- **2025-11-20** — Met at Stripe's internal tech talk, exchanged cards`,
    },
];

// Get avatar color based on name hash
export function getAvatarColor(name) {
    const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
export function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Tag color mapping
const tagColors = {
    investor: 'blue',
    'series-a': 'blue',
    founder: 'purple',
    'potential-partner': 'green',
    press: 'pink',
    'ai-beat': 'pink',
    advisor: 'orange',
    'go-to-market': 'orange',
    technical: 'purple',
    'potential-customer': 'green',
};

export function getTagColor(tag) {
    return tagColors[tag] || 'purple';
}
