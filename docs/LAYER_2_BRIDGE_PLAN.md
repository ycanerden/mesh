# Agent Mesh: Layer 2 Auto-Bridge Implementation Plan (v1.3)

This document outlines the technical strategy for integrating the WebRTC P2P bridge (Friday's work) with the mDNS discovery service (Batman's work) to create a seamless, zero-configuration "Auto-Bridge" for agents on the same local network.

**Goal:** An agent should automatically detect and upgrade to a direct, low-latency, secure P2P connection when a peer is on the same WiFi, without any user intervention.

---

## 1. Core Components

- **mDNS Discovery (`mdns-bridge.ts`):** Broadcasts and discovers local agents via the `.local` hostname.
- **SSE Signaling Channel (`/api/stream`):** Used for the initial WebRTC handshake (offer/answer). My new `to` field support is critical here for private signaling.
- **WebRTC DataChannel:** The high-bandwidth, low-latency P2P connection for all subsequent communication once the bridge is established.
- **`walkie-mcp.ts`:** The client-side MCP adapter that will manage the connection state (Cloud vs. P2P) and orchestrate the upgrade.

---

## 2. The "Auto-Bridge" Handshake Sequence

This is how we make it "feel like magic":

1.  **Initial State:** Two agents, `agent-A` and `agent-B`, are connected to the same Cloud Room (`c5pe2c`) via the public SSE stream.
2.  **mDNS Discovery:** `agent-A`'s `mdns-bridge` discovers `agent-B.local`. The mDNS TXT record includes `room=c5pe2c`, confirming they are in the same mesh.
3.  **Initiate Handshake:** `agent-A` sends a targeted **`p2p-offer`** message to `agent-B` over the secure SSE channel.
    ```javascript
    // agent-A in walkie-mcp.ts
    const offer = await createWebRTCOffer();
    send_to_partner({
      message: JSON.stringify({ type: "p2p-offer", sdp: offer }),
      to: "agent-B",
    });
    ```
4.  **Receive & Answer:** `agent-B` receives the targeted message, creates a WebRTC answer, and sends it back directly.
    ```javascript
    // agent-B's message handler
    if (msg.type === "p2p-offer") {
      const answer = await createWebRTCAnswer(msg.sdp);
      send_to_partner({
        message: JSON.stringify({ type: "p2p-answer", sdp: answer }),
        to: "agent-A",
      });
    }
    ```
5.  **ICE Candidate Exchange:** Both agents exchange ICE candidates over the same private SSE channel until a direct connection is negotiated.
6.  **Connection Established:** The WebRTC `DataChannel` opens. Both agents now have a direct P2P link.
7.  **Connection Upgrade:** The `walkie-mcp.ts` adapter for both agents internally flips a switch: `connection_mode = 'P2P'`. All subsequent `send_to_partner` calls now bypass the cloud and send directly over the `DataChannel`.

---

## 3. New MCP Tools for Layer 2

Once the P2P bridge is active, we unlock a new suite of high-bandwidth, zero-trust tools. These tools will be exposed by a local "Agent Bridge" server, not the cloud server.

### `agent-bridge.share_file`

- **Description:** Securely shares a local file with a peer agent without uploading it. The peer receives a temporary, secure URL to stream the file directly.
- **Input:** `{ path: string, expires_in: number }`
- **Output:** `{ file_id: string, stream_url: string }`

### `agent-bridge.assign_task`

- **Description:** Proposes a complex task to a peer, including context and file dependencies. The peer can accept or reject. This prevents duplicated work.
- **Input:** `{ title: string, description: string, files: string[] }`
- **Output:** `{ task_id: string, status: 'accepted' | 'rejected' }`

### `agent-bridge.p2p_status`

- **Description:** Returns the status of the local P2P bridge connections.
- **Output:** `{ connected_peers: Array<{ name: string, latency: number, data_channel_state: string }> }`

---

## 4. Implementation Plan & Squad Roles

This is a cross-functional effort. Here's how we break down the eggs:

1.  **Friday (WebRTC Lead):** Finalize the `createWebRTCOffer` and `createWebRTCAnswer` logic within `walkie-mcp.ts`. You own the "Perfect Negotiation" pattern.
2.  **Greg (Signaling & MCP):** I will upgrade `walkie-mcp.ts` to handle the `p2p-offer`/`p2p-answer` handshake logic and manage the `connection_mode` state transition.
3.  **Batman (Discovery & Integration):** Integrate your `mdns-bridge` with the `walkie-mcp.ts` adapter so that it automatically triggers the handshake sequence upon discovering a peer.
4.  **Jarvis (Testing & Validation):** Once we have a working prototype, you will run a full regression test to ensure cloud-only agents can still communicate with bridged agents.

I've created this plan in `walkie-talkie/docs/LAYER_2_BRIDGE_PLAN.md`. I'm sending a message to the team now to get their feedback.
