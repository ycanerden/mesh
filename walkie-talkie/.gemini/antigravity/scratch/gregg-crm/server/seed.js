import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Sample data to seed
const sampleContacts = [
    {
        id: 'sarah-jennings',
        frontmatter: {
            name: 'Sarah Jennings',
            email: 'sarah.j@acmecorp.com',
            company: 'Acme Corp',
            role: 'VP Engineering',
            status: 'warm',
            tags: ['investors', 'tech'],
            phone: '+1 (555) 019-2834',
            linkedin: 'linkedin.com/in/sarahjennings',
            last_contacted: '2023-11-15',
            created: '2023-10-01',
        },
        body: `## Notes\n\nMet Sarah at the SF Tech Summit. They are currently evaluating new CRM solutions for their sales team of 50.\n\nShe seemed particularly interested in our local-first approach because of their strict data compliance requirements.\n\n### Next Steps\n- Follow up regarding the enterprise security whitepaper\n- Schedule a technical deep-dive with her lead architect\n\n## Activity\n- **2023-11-15** — Sent follow-up email with pricing tiers\n- **2023-11-10** — Initial discovery call (30 min)\n- **2023-11-05** — Met at SF Tech Summit`,
    },
    {
        id: 'marcus-chen',
        frontmatter: {
            name: 'Marcus Chen',
            email: 'm.chen@novaventures.vc',
            company: 'Nova Ventures',
            role: 'Partner',
            status: 'hot',
            tags: ['investors', 'series-a'],
            phone: '+1 (555) 882-1044',
            linkedin: 'linkedin.com/in/marcuschenvc',
            last_contacted: '2023-11-18',
            created: '2023-09-12',
        },
        body: `## Notes\n\nMarcus is leading the Series A round for local-first developer tools. Nova Ventures has a strong portfolio in DevTools.\n\nThey generally write checks between $2M-$5M. He wants to see our Q4 retention metrics before committing.\n\n## Activity\n- **2023-11-18** — Pitch meeting at their Sand Hill road office\n- **2023-10-22** — Emailed Q3 update metrics\n- **2023-09-15** — Intro via David at Founders Fund`,
    },
    {
        id: 'elena-rodriguez',
        frontmatter: {
            name: 'Elena Rodriguez',
            email: 'elena@techcrunch.test',
            company: 'TechCrunch',
            role: 'Senior Editor',
            status: 'cold',
            tags: ['press', 'media'],
            phone: '',
            linkedin: 'linkedin.com/in/elenarodriguez',
            last_contacted: '2023-08-10',
            created: '2023-08-01',
        },
        body: `## Notes\n\nElena covers early-stage startups and productivity tools. She mentioned she's working on a piece about "The return to desktop apps".\n\nNeed to pitch her our story once we hit 1,000 active users.\n\n## Activity\n- **2023-08-10** — Grabbed coffee in SOMA, pitched the vision\n- **2023-08-02** — Connected on Twitter`,
    },
    {
        id: 'david-kim',
        frontmatter: {
            name: 'David Kim',
            email: 'dkim@stripe.test',
            company: 'Stripe',
            role: 'Product Manager',
            status: 'warm',
            tags: ['partners', 'fintech'],
            phone: '',
            linkedin: '',
            last_contacted: '2023-11-01',
            created: '2023-10-15',
        },
        body: `## Notes\n\nDiscussing a potential integration block for our CRM to pull in Stripe payment histories natively.\n\nDavid is supportive but needs engineering resources to approve the API usage limits.\n\n## Activity\n- **2023-11-01** — Zoom call to review API docs\n- **2023-10-18** — Sent technical proposal`,
    },
    {
        id: 'alex-turner',
        frontmatter: {
            name: 'Alex Turner',
            email: 'alex@startup-founder.test',
            company: 'Stealth Startup',
            role: 'CEO',
            status: 'hot',
            tags: ['sales', 'early-adopter'],
            phone: '',
            linkedin: '',
            last_contacted: '2023-11-20',
            created: '2023-11-19',
        },
        body: `## Notes\n\nAlex found us on Product Hunt. Needs a CRM that doesn't feel like a data entry chore. He's very technical, loves the Markdown approach.\n\nAgreed to be a beta tester for the new pipeline view.\n\n## Activity\n- **2023-11-20** — Onboarding call\n- **2023-11-19** — Signed up for beta tier`,
    }
];

const CONTACTS_DIR = path.join(process.cwd(), 'contacts');

// Ensure the contacts directory exists
if (!fs.existsSync(CONTACTS_DIR)) {
    fs.mkdirSync(CONTACTS_DIR, { recursive: true });
}

console.log(`Seeding ${sampleContacts.length} contacts to ${CONTACTS_DIR}...`);

sampleContacts.forEach(contact => {
    const { id, frontmatter, body } = contact;
    const filePath = path.join(CONTACTS_DIR, `${id}.md`);

    // Use gray-matter to stringify the markdown with frontmatter
    const fileContent = matter.stringify(body || '', frontmatter);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`Created: ${id}.md`);
});

console.log('Done!');
