# Plan: founder-skills — New Repo

## Context

`habitat-skills` is a mature collection of 15 founder-focused skills, but it has gaps vs.
Anthropic's official skill spec (name/folder mismatch, missing Examples and Troubleshooting
sections, empty references/, no metadata block, no license field). The X post and official PDF
also confirm the ecosystem is maturing fast — skills need to be distributable on claude.ai
and skills.sh, not just Claude Code.

The goal is to create a **new repo called `founder-skills`** with 6 battle-tested, fully
spec-compliant skills — leaner and more polished than the current 15.

---

## What Changes

### New repo: `founder-skills`
- Fresh GitHub repo (not a fork of habitat-skills)
- 6 skills only: `idea-validation`, `competitor-research`, `mvp-scope`, `landing-page`,
  `first-users`, `launch-plan`
- Each skill is spec-compliant and ready to upload to claude.ai or clone for Claude Code

### Skills NOT carried over
- `onboarding`, `founder-context`, `sprint-coach`, `prototype-sprint` — cut
- `social-content`, `pitch-deck`, `vc-research`, `portfolio-research`, `customer-segments` — cut
- These can live in habitat-skills; founder-skills stays focused

---

## Spec Compliance Changes (all 6 skills)

Based on Anthropic's official guide (PDF):

| Issue | Current State | Fix |
|---|---|---|
| `name` vs folder mismatch | `habitat-competitor-research` but folder is `competitor-research` | Drop prefix: `name: competitor-research` |
| `version` at top level | `version: 1.0.0` in frontmatter root | Move into `metadata:` block |
| No `license` field | Missing | Add `license: MIT` |
| No `metadata:` block | Missing | Add with `author`, `version`, `category`, `tags` |
| No negative triggers | Descriptions don't say "Do NOT use for..." | Add scope boundary to each description |
| Missing `## Examples` section | Not present | Add 2-3 examples per skill (user says → actions → result) |
| Missing `## Troubleshooting` section | Not present | Add common failure modes per skill |
| Empty `references/` dirs | Placeholder only | Populate with frameworks offloaded from SKILL.md body |
| `## Before Starting` pattern | Present, good | Keep — valuable context-first pattern |

---

## File Structure

```
founder-skills/
├── README.md                          # Repo-level docs (NOT inside skill folders per spec)
├── CLAUDE.md                          # Project conventions
├── CONTRIBUTING.md                    # Skill quality standards
├── LICENSE                            # MIT
└── skills/
    ├── idea-validation/
    │   ├── SKILL.md
    │   └── references/
    │       ├── validation-frameworks.md  # TAM/SAM/SOM, problem severity rubric
    │       └── mom-test-questions.md     # Question bank for customer interviews
    ├── competitor-research/
    │   ├── SKILL.md
    │   └── references/
    │       └── positioning-frameworks.md  # 2x2 matrix, positioning canvas
    ├── mvp-scope/
    │   ├── SKILL.md
    │   └── references/
    │       └── feature-prioritization.md  # MoSCoW, RICE, effort/impact matrix
    ├── landing-page/
    │   ├── SKILL.md
    │   └── references/
    │       └── copy-frameworks.md         # PAS, AIDA, BAB templates
    ├── first-users/
    │   ├── SKILL.md
    │   └── references/
    │       └── outreach-templates.md      # Cold DM/email templates by channel
    └── launch-plan/
        ├── SKILL.md
        └── references/
            └── launch-checklist.md        # Pre/launch/post checklists
```

---

## YAML Frontmatter Template (per skill)

```yaml
---
name: idea-validation
description: Validate a startup idea using structured frameworks — problem-solution fit,
  TAM/SAM/SOM market sizing, Mom Test interview design, assumption mapping, and go/no-go
  scorecard. Use when the user says "validate my idea", "is this a good idea", "should I
  build this", "market size", "TAM", "problem-solution fit", or "Mom Test". Do NOT use for
  competitive landscape analysis (use competitor-research instead).
license: MIT
metadata:
  author: Can Erden
  version: 2.0.0
  category: validation
  tags: [startup, validation, market-research, ideation]
---
```

Rules enforced:
- `name` = kebab-case, matches folder name, no `habitat-` prefix
- `description` = under 1024 chars, includes what + when + negative trigger
- No XML angle brackets anywhere in frontmatter
- `version` inside `metadata:` not at root level

---

## Content Changes Per Skill

### All 6 skills get these new sections appended:

**`## Examples`** (per spec recommendation):
```
### Example 1: Early-stage ideation
User says: "I have an idea for an AI scheduling tool, is it worth pursuing?"
Actions:
1. Run problem validation — identify hair-on-fire vs. nice-to-have
2. Size the market (TAM/SAM/SOM)
3. Map top 3 assumptions
4. Output a go/no-go scorecard
Result: Validation scorecard with confidence rating and next steps
```

**`## Troubleshooting`** (per spec recommendation):
```
### Skill triggers but user gets generic advice
Cause: No founder-context.md and user gave vague input
Solution: Ask for one-sentence idea + specific audience before running frameworks

### Market sizing feels made up
Cause: No real data source used
Solution: Reference specific data points (reports, job postings, tool pricing pages)
  and show calculation methodology explicitly
```

**`references/` files** contain the detailed frameworks currently embedded inline in SKILL.md,
reducing SKILL.md body length and enabling progressive disclosure (level 3 of 3).

---

## README.md Changes

New README covers:
1. What the skills do (outcome-focused, not feature-focused per spec guidance)
2. Installation for **claude.ai** (upload zip) AND **Claude Code** (git clone)
3. Skills table with one-line descriptions
4. Links to official Anthropic skills docs

Installation section per official spec:

```bash
# Claude Code (clone into your project)
git clone https://github.com/ycanerden/founder-skills.git .claude/skills/founder

# Claude.ai (upload each skill folder as .zip via Settings > Capabilities > Skills)
```

---

## CLAUDE.md Changes

Update to reflect:
- 6 skills (not 15)
- Official spec naming rules (no prefix, no README.md inside skill folders)
- `references/` usage guidance
- Point to anthropics/skills for upstream patterns

---

## Files to Create (new repo)

1. `README.md` — new, outcome-focused
2. `CLAUDE.md` — updated conventions
3. `CONTRIBUTING.md` — skill quality checklist from PDF Reference A
4. `LICENSE` — MIT
5. `skills/idea-validation/SKILL.md` — updated from habitat-skills source
6. `skills/idea-validation/references/validation-frameworks.md`
7. `skills/idea-validation/references/mom-test-questions.md`
8. `skills/competitor-research/SKILL.md` — updated
9. `skills/competitor-research/references/positioning-frameworks.md`
10. `skills/mvp-scope/SKILL.md` — updated
11. `skills/mvp-scope/references/feature-prioritization.md`
12. `skills/landing-page/SKILL.md` — updated
13. `skills/landing-page/references/copy-frameworks.md`
14. `skills/first-users/SKILL.md` — updated
15. `skills/first-users/references/outreach-templates.md`
16. `skills/launch-plan/SKILL.md` — updated
17. `skills/launch-plan/references/launch-checklist.md`

**Source files to pull content from (habitat-skills):**
- `skills/idea-validation/SKILL.md` → `/Users/canerden/habitat-skills/skills/idea-validation/SKILL.md`
- `skills/competitor-research/SKILL.md` → `/Users/canerden/habitat-skills/skills/competitor-research/SKILL.md`
- `skills/mvp-scope/SKILL.md` → `/Users/canerden/habitat-skills/skills/mvp-scope/SKILL.md`
- `skills/landing-page/SKILL.md` → `/Users/canerden/habitat-skills/skills/landing-page/SKILL.md`
- `skills/first-users/SKILL.md` → `/Users/canerden/habitat-skills/skills/first-users/SKILL.md`
- `skills/launch-plan/SKILL.md` → `/Users/canerden/habitat-skills/skills/launch-plan/SKILL.md`

---

## Verification

After implementation:
1. Run `ls -la skills/*/SKILL.md` — all 6 files exist, named exactly `SKILL.md`
2. Check each `name:` field matches its parent folder name
3. Verify no `<` or `>` characters in frontmatter
4. Verify each description is under 1024 characters
5. Confirm `references/` directories have at least one real file each
6. Confirm no `README.md` inside any skill folder
7. Test: open a new Claude session, install skill, type a trigger phrase, verify the skill loads
