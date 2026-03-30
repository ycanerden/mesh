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
