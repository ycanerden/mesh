/**
 * Walkie-Talkie Load Test (Bun)
 * Simulates multiple agents in a room to test SSE and message delivery.
 * 
 * Usage: bun walkie-talkie/load-test.ts <room> <num_agents> <duration_sec>
 */

const ROOM = process.argv[2] || "loadtest-" + Math.random().toString(36).substring(7);
const NUM_AGENTS = parseInt(process.argv[3] || "10");
const DURATION_SEC = parseInt(process.argv[4] || "60");
const SERVER_URL = process.env.SERVER_URL || "https://p2p-production-983f.up.railway.app";

console.log(`[load-test] Starting with ${NUM_AGENTS} agents in room ${ROOM} for ${DURATION_SEC}s...`);

interface AgentStats {
  received: number;
  sent: number;
  errors: number;
}

const stats: Record<string, AgentStats> = {};

async function runAgent(name: string) {
  stats[name] = { received: 0, sent: 0, errors: 0 };
  
  // Connect SSE
  const abortController = new AbortController();
  const sseUrl = `${SERVER_URL}/api/stream?room=${ROOM}&name=${name}`;
  
  const ssePromise = (async () => {
    try {
      const response = await fetch(sseUrl, { signal: abortController.signal });
      if (!response.body) return;
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        if (chunk.includes("event: message")) {
          stats[name].received++;
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(`[agent:${name}] SSE Error: ${e}`);
        stats[name].errors++;
      }
    }
  })();

  // Periodically send messages, cards, and targeted handshakes
  const sendInterval = setInterval(async () => {
    try {
      const rand = Math.random();
      if (rand < 0.7) {
        // Normal message
        const res = await fetch(`${SERVER_URL}/api/send?room=${ROOM}&name=${name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `Load test from ${name} at ${new Date().toISOString()}` })
        });
        if (res.ok) stats[name].sent++;
        else stats[name].errors++;
      } else if (rand < 0.85) {
        // Publish card
        const res = await fetch(`${SERVER_URL}/api/publish?room=${ROOM}&name=${name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card: {
              agent: { name, model: "load-test-bot" },
              skills: ["stress-testing", "scaling"],
              capabilities: { stress: true }
            }
          })
        });
        if (!res.ok) stats[name].errors++;
      } else {
        // Targeted handshake (to a random agent)
        const target = `agent-${Math.floor(Math.random() * NUM_AGENTS)}`;
        if (target !== name) {
          const res = await fetch(`${SERVER_URL}/api/send?room=${ROOM}&name=${name}&to=${target}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `HANDSHAKE: WebRTC signaling from ${name} to ${target}` })
          });
          if (res.ok) stats[name].sent++;
          else stats[name].errors++;
        }
      }
    } catch (e) {
      stats[name].errors++;
    }
  }, 2000 + Math.random() * 3000); // Every 2-5 seconds

  // Wait for duration
  await new Promise(resolve => setTimeout(resolve, DURATION_SEC * 1000));
  
  clearInterval(sendInterval);
  abortController.abort();
  await ssePromise;
}

async function main() {
  const agents = Array.from({ length: NUM_AGENTS }, (_, i) => `agent-${i}`);
  
  console.log(`[load-test] Launching agents...`);
  await Promise.all(agents.map(runAgent));
  
  console.log(`\n[load-test] Results for room ${ROOM}:`);
  console.table(stats);
  
  const totalSent = Object.values(stats).reduce((acc, s) => acc + s.sent, 0);
  const totalReceived = Object.values(stats).reduce((acc, s) => acc + s.received, 0);
  const totalErrors = Object.values(stats).reduce((acc, s) => acc + s.errors, 0);
  
  console.log(`\nTotals:`);
  console.log(`  Sent:     ${totalSent}`);
  console.log(`  Received: ${totalReceived}`);
  console.log(`  Errors:   ${totalErrors}`);
  
  // Theoretical expected received = totalSent * (NUM_AGENTS - 1)
  // Because each message is sent to everyone else in the room
  const expectedReceived = totalSent * (NUM_AGENTS - 1);
  const efficiency = expectedReceived > 0 ? (totalReceived / expectedReceived) * 100 : 100;
  
  console.log(`  Delivery Efficiency: ${efficiency.toFixed(2)}%`);
}

main().catch(console.error);
