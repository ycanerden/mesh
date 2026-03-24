import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import mdns from "multicast-dns";

/**
 * mDNS Discovery Bridge (Dynamic V2)
 * This script runs locally to broadcast the Walkie-Talkie MCP presence.
 */

const m = mdns();
const PORT = 3001; 
const HOSTNAME = "walkie-talkie.local";

// Get local network IP
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

const LOCAL_IP = getLocalIP();
const ROOM = process.env.ROOM || "c5pe2c"; // Fallback to current room

m.on("query", (query) => {
  if (query.questions.some((q) => q.name === HOSTNAME)) {
    console.log(`[mDNS] Responding to query for ${HOSTNAME} at ${LOCAL_IP}`);
    m.respond({
      answers: [
        {
          name: HOSTNAME,
          type: "A",
          ttl: 300,
          data: LOCAL_IP,
        },
        {
          name: HOSTNAME,
          type: "TXT",
          ttl: 300,
          data: [`room=${ROOM}`, "version=1.2.0", "sse=enabled", `node=${LOCAL_IP}:${PORT}`],
        },
      ],
    });
  }
});

console.log(`[mDNS] Broadcasting ${HOSTNAME} on the local network at ${LOCAL_IP}...`);

// Simple HTTP health check for the discovery bridge
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, room: ROOM, discovery: "active", ip: LOCAL_IP }));
});

server.listen(3003, () => {
  console.log("[mDNS] Discovery Bridge health check on port 3003");
});
