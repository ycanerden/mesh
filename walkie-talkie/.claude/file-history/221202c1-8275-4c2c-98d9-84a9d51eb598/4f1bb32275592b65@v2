# Habitat Website: Light Mode + New Pages

## Context
The Habitat homepage (`/Users/canerden/Downloads/habitat-homepage.html`) was already revised by Claude Opus to reflect the full ecosystem (evenings + hackathons + residency). The user now wants to:
1. Convert it from dark to **light mode**
2. Add **3 new pages**: Residency, Hackathon, Contact/Apply
3. Wire the contact form to **Google Sheets** via Google Apps Script
4. Keep everything as zero-dependency static HTML files (no frameworks)

The end goal is a self-contained folder deployable to Antigravity or Netlify.

---

## Deliverables

### File structure
```
habitat-website/
├── index.html          ← revised homepage (light mode)
├── residency.html      ← new
├── hackathon.html      ← new
├── contact.html        ← new (with Google Sheets form)
└── images/             ← placeholder folder (user adds photos)
    ├── event-1.jpg … event-5.jpg
    ├── logos/
    └── people/
```

---

## Step 1 — Convert homepage to light mode

Change CSS variables in `index.html`:

| Variable | Old (dark) | New (light) |
|---|---|---|
| `--black` | `#0a0a0a` | `#fafaf8` (warm white bg) |
| `--white` | `#f5f2eb` | `#1a1918` (near-black text) |
| `--cream` | `#ede9df` | `#f0ede6` (light section bg) |
| `--gray` | `#8a8780` | `#6b6864` (secondary text) |
| `--gray-light` | `#c4c1b8` | `#9e9b96` (muted) |
| `--accent` | `#3d5afc` | `#3d5afc` (keep) |
| Teal/Purple/Coral | keep values | adjust if too faint on light |

Additional light-mode CSS changes:
- Nav background: `rgba(250, 250, 248, 0.95)` with `backdrop-filter: blur(20px)`
- Card backgrounds: `#ffffff` or `#f5f2eb` with subtle border `1px solid rgba(0,0,0,0.08)`
- Stats bar: light background variant
- Photo strip background: `#f0ede6`
- Footer: `#1a1918` (dark footer still works, gives contrast)
- Box shadows: `rgba(0,0,0,0.06)` instead of dark glows

---

## Step 2 — Create `residency.html`

Sections:
1. **Nav** (shared design, links to all pages)
2. **Hero** — "Live and build with 4 other founders for 7 days" + "Coming 2026" badge
3. **What is the Residency** — format overview (dates, location, cohort size = 5)
4. **Program structure** — daily schedule (morning work, afternoon mentorship, evening demos)
5. **Mentorship** — dedicated mentor, VC access, peer network
6. **Demo Day** — culminating event, pitch to sponsors and network
7. **Who it's for** — pre-revenue or early-revenue technical founders
8. **Apply / Join waitlist** — CTA linking to contact.html with `?program=residency`

---

## Step 3 — Create `hackathon.html`

Sections:
1. **Nav**
2. **Hero** — "One day. One team. One working product." + format callout
3. **Format** — full day (10am–8pm), teams of 2–3, technical output = working demo
4. **Who attends** — developers, technical founders, CS students
5. **Sponsors** — VC and YC founder backing, what they offer (prizes, cloud credits, deal flow)
6. **How it ends** — pitches directly to sponsors, feedback, connections
7. **Past events / stats** (if available, otherwise Coming Soon)
8. **Register / Interest form** — CTA to contact.html with `?program=hackathon`

---

## Step 4 — Create `contact.html` (Google Sheets form)

### Form fields
- Name
- Email
- Which program: dropdown (Evenings / Hackathon / Residency / General question)
- Message / anything you want us to know
- Submit button

### Google Sheets connection (Google Apps Script)

**User will do once (setup steps included as comments in the file):**
1. Create a new Google Sheet
2. Open Extensions → Apps Script, paste the Web App script
3. Deploy as Web App (execute as: Me, access: Anyone)
4. Copy the deployment URL → paste into `contact.html`

**Apps Script (included in contact.html as a comment block):**
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.name, data.email, data.program, data.message]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Form JS (in contact.html):**
```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = { name, email, program, message };
  await fetch('YOUR_APPS_SCRIPT_URL', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  // Show success message
});
```

No CORS issues — Google Apps Script handles it natively.

---

## Step 5 — Update navigation on all pages

Each page gets the same nav with links:
- **[Habitat]** logo → index.html
- Evenings → index.html#products
- Hackathons → hackathon.html
- Residency → residency.html
- Apply → contact.html

---

## Verification

1. Open each HTML file directly in a browser (no server needed for static files)
2. Check light mode renders correctly across all sections
3. Test contact form: fill it out, check Google Sheet receives the row
4. Test nav links work across all 4 pages
5. Test `?program=hackathon` pre-selects the right dropdown option
6. Resize to mobile (768px) to check responsive layout

---

## Critical file
- `/Users/canerden/Downloads/habitat-homepage.html` — source of truth for design system
