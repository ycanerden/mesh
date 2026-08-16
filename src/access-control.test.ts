import { test, expect } from "bun:test";
import {
  createRoom,
  canAgentSend,
  kickAgent,
  unbanAgent,
  addToWhitelist,
  removeFromWhitelist,
  getWhitelist,
  getBanned,
  generateAgentToken,
  claimAgentName,
  getAgentToken,
} from "./rooms.js";

// ── Agent Banning ──────────────────────────────────────────────────────────

test("unbanned agent can send to open room", () => {
  const { code } = createRoom();
  expect(canAgentSend(code, "agent1")).toBe(true);
});

test("banned agent cannot send", () => {
  const { code } = createRoom();
  kickAgent(code, "agent1");
  expect(canAgentSend(code, "agent1")).toBe(false);
});

test("unbanning restores send permission", () => {
  const { code } = createRoom();
  kickAgent(code, "agent1");
  expect(canAgentSend(code, "agent1")).toBe(false);
  unbanAgent(code, "agent1");
  expect(canAgentSend(code, "agent1")).toBe(true);
});

test("banning one agent doesn't affect others", () => {
  const { code } = createRoom();
  kickAgent(code, "agent1");
  expect(canAgentSend(code, "agent2")).toBe(true);
});

// ── Whitelist ──────────────────────────────────────────────────────────────

test("empty whitelist allows everyone", () => {
  const { code } = createRoom();
  expect(getWhitelist(code)).toEqual([]);
  expect(canAgentSend(code, "anyone")).toBe(true);
});

test("whitelist restricts to listed agents only", () => {
  const { code } = createRoom();
  addToWhitelist(code, "trusted-agent");
  expect(canAgentSend(code, "trusted-agent")).toBe(true);
  expect(canAgentSend(code, "random-agent")).toBe(false);
});

test("removing from whitelist when whitelist becomes empty reopens room", () => {
  const { code } = createRoom();
  addToWhitelist(code, "agent1");
  expect(canAgentSend(code, "agent2")).toBe(false);
  removeFromWhitelist(code, "agent1");
  expect(canAgentSend(code, "agent2")).toBe(true); // whitelist empty = open
});

// ── Agent Tokens ──────────────────────────────────────────────────────────

test("registered token is required when set", () => {
  const { code } = createRoom();
  const token = generateAgentToken(code, "secure-agent");
  // Without token = denied
  expect(canAgentSend(code, "secure-agent")).toBe(false);
  // Wrong token = denied
  expect(canAgentSend(code, "secure-agent", "wrong-token")).toBe(false);
  // Correct token = allowed
  expect(canAgentSend(code, "secure-agent", token)).toBe(true);
});

test("token takes precedence over whitelist", () => {
  const { code } = createRoom();
  addToWhitelist(code, "agent1");
  const token = generateAgentToken(code, "agent1");
  // On whitelist but wrong token = denied (token takes precedence)
  expect(canAgentSend(code, "agent1", "wrong")).toBe(false);
  // Correct token = allowed
  expect(canAgentSend(code, "agent1", token)).toBe(true);
});

// ── Claim name (first bot to take a name keeps it) ─────────────────────────

test("claimAgentName: first claim wins and locks the name", () => {
  const { code } = createRoom();
  const first = claimAgentName(code, "can-grok");
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.created).toBe(true);
  expect(first.token.length).toBe(64);
  expect(canAgentSend(code, "can-grok", first.token)).toBe(true);
  expect(canAgentSend(code, "can-grok")).toBe(false);
  expect(canAgentSend(code, "can-grok", "stolen")).toBe(false);
});

test("claimAgentName: friend cannot take an already claimed name", () => {
  const { code } = createRoom();
  const first = claimAgentName(code, "can-grok");
  expect(first.ok).toBe(true);
  const second = claimAgentName(code, "can-grok");
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.error).toBe("name_taken");
});

test("claimAgentName: owner can reconnect with the same token", () => {
  const { code } = createRoom();
  const first = claimAgentName(code, "sam-hermes");
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  const again = claimAgentName(code, "sam-hermes", first.token);
  expect(again.ok).toBe(true);
  if (!again.ok) return;
  expect(again.created).toBe(false);
  expect(again.token).toBe(first.token);
});

test("claimAgentName: different friends can claim different names", () => {
  const { code } = createRoom();
  const a = claimAgentName(code, "can-grok");
  const b = claimAgentName(code, "alex-grok");
  const c = claimAgentName(code, "sam-hermes");
  expect(a.ok && b.ok && c.ok).toBe(true);
  if (a.ok && b.ok && c.ok) {
    expect(a.token).not.toBe(b.token);
    expect(getAgentToken(code, "can-grok")).toBe(a.token);
  }
});

test("claimAgentName: rejects empty and system names", () => {
  const { code } = createRoom();
  expect(claimAgentName(code, "   ").ok).toBe(false);
  expect(claimAgentName(code, "system").ok).toBe(false);
});
