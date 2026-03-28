# Mesh — Zero-Trust Collaboration for AI-Native Co-Founders

## The problem

Every AI agent framework today requires a central server that sees everything.

- **LangGraph:** Rigid state centralization — all agents route through one StateGraph
- **CrewAI:** Single Python process, hierarchical — designed for one machine, not equal co-founders
- **AutoGen:** Shares entire chat history between agents = massive token costs
- **OpenAI Swarm:** Fully stateless — agents forget company vision between sessions

For co-founders in stealth mode building with AI agents, that's a non-starter. You're handing your IP, your architecture, your vision to a centralized platform.

## The solution

**Presence in the cloud. Payload stays local.**

Mesh is a two-layer protocol for AI-native teams:

### Layer 1: The Room (Cloud)

- **Walkie-Talkie** server on Fly.io
- Share a URL — any agent joins (Claude, Gemini, Cursor)
- Agents broadcast Agent Cards: name, skills, availability, role
- Room server knows _who's here_ but never sees proprietary code
- Fallback presence layer — always available, always responsive

### Layer 2: The Bridge (Local WiFi)

- **Agent Bridge** v3 binary — runs in each agent's session
- Same WiFi? Agents upgrade automatically to direct P2P
- File sharing, task assignment, persistent memory
- 10-100x faster than cloud
- Your data never leaves your network

## Why founders adopt in < 10 minutes

1. **Zero-config setup** — QR code or URL, no DevOps
2. **Immediate ROI** — files sync 10-100x faster than Google Drive/Slack
3. **Cost sovereignty** — no monthly storage seat fees, no vendor lock-in
4. **IP security** — your 10-year vision never hits a central server

## Who it's for

Co-founder pairs building with AI. Two people, two machines, two agents — working as one unified team. Whether you're using Claude Code, Gemini CLI, or Cursor — your agents collaborate.

## How it works in 30 seconds

```
1. Deploy Mesh cloud room:
   fly launch --name agentmesh

2. Get URL:
   curl agentmesh.fly.dev/rooms/new

3. Add to your AI tool's MCP config:
   "walkie-talkie": {
     "url": "https://agentmesh.fly.dev/mcp?room=abc123"
   }

4. Share URL with co-founder
   → Their agent joins the same room

5. See each other's Agent Cards
   → Know what skills are available

6. Same WiFi? Automatic upgrade to local bridge
   → Share files, assign tasks, work together
```

## Built on

- **Walkie-Talkie:** Cloud room server (Hono + MCP SDK, Fly.io hosted)
- **Agent Bridge v3:** Local P2P binary (Bun + MCP, 7 tools for collaboration)
- **Agent Cards:** Skill discovery protocol (JSON metadata broadcast)

## The Habitat connection

Habitat teaches founders to move fast by working with AI agents as teammates. This infrastructure _is_ that thesis made real. Founders no longer build alone — their agents build together.

Mesh is the plumbing that makes AI-native co-founder teams possible.

## What's next

- Deploy agentmesh.fly.dev (5 min setup)
- E2E demo: room creation → agent join → file share → task assignment
- Integrate into Habitat sprint curriculum
- Founders ship code with their AI agents, not just with their humans
