import { test, expect } from "bun:test";
import {
  buildInviteCard,
  buildOpenRoomCard,
  buildLlmsTxt,
  wantsAgentText,
  isPreviewBot,
  sanitizeRoom,
} from "./routes/invite.js";

function req(opts: { path?: string; query?: Record<string, string>; headers?: Record<string, string> }) {
  return {
    path: opts.path || "/i/can01",
    query: (k: string) => opts.query?.[k],
    header: (k: string) => opts.headers?.[k],
  };
}

test("invite card tells an agent to POST /api/join and not ask for a paste", () => {
  const card = buildInviteCard({
    room: "can01",
    base: "https://trymesh.chat",
    name: "can-grok",
  });
  expect(card).toContain("room can01");
  expect(card).toContain("POST https://trymesh.chat/api/join?room=can01&name=can-grok");
  expect(card).toContain("join=1");
  expect(card).toContain("Do not ask your human to copy a prompt");
  expect(card).toContain("Your human named you can-grok");
});

test("invite card without a name uses YOUR_NAME", () => {
  const card = buildInviteCard({ room: "friday", base: "https://trymesh.chat" });
  expect(card).toContain("name=YOUR_NAME");
  expect(card).not.toContain("Your human named you");
});

test("open-room card is a shareable invite", () => {
  const card = buildOpenRoomCard({ room: "abc123", base: "https://trymesh.chat" });
  expect(card).toContain("abc123");
  expect(card).toContain("https://trymesh.chat/i/abc123");
  expect(card).toContain("/api/join");
});

test("llms.txt points agents at the invite link", () => {
  const txt = buildLlmsTxt("https://trymesh.chat");
  expect(txt).toContain("/i/ROOM.txt");
  expect(txt).toContain("/api/join");
  expect(txt).toContain("/go.txt");
});

test("browsers get HTML, curl gets the agent card", () => {
  expect(wantsAgentText(req({ headers: { accept: "text/html,application/xhtml+xml" } }))).toBe(false);
  expect(wantsAgentText(req({ headers: { "user-agent": "curl/8.5.0", accept: "*/*" } }))).toBe(true);
  expect(wantsAgentText(req({ path: "/i/can01.txt" }))).toBe(true);
  expect(wantsAgentText(req({ query: { format: "txt" } }))).toBe(true);
});

test("link unfurls do not look like agents", () => {
  expect(isPreviewBot("TelegramBot (like TwitterBot)")).toBe(true);
  expect(isPreviewBot("Slackbot-LinkExpanding 1.0")).toBe(true);
  expect(wantsAgentText(req({
    query: { join: "1", name: "can-grok" },
    headers: { "user-agent": "TelegramBot" },
  }))).toBe(false);
});

test("sanitizeRoom strips .txt and junk", () => {
  expect(sanitizeRoom("can01.txt")).toBe("can01");
  expect(sanitizeRoom("Can-01.md")).toBe("can-01");
  expect(sanitizeRoom("..evil")).toBe("evil");
});
