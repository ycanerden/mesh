import { test, expect } from "bun:test";
import {
  createRoom,
  verifyAdmin,
  setRoomPassword,
  verifyRoomPassword,
  resetAdminToken,
} from "./rooms.js";

// ── Admin Token Tests ──────────────────────────────────────────────────────

test("createRoom returns a valid admin_token", () => {
  const { code, admin_token } = createRoom();
  expect(admin_token).toBeDefined();
  expect(admin_token.length).toBe(64); // 32 bytes hex
  expect(admin_token).toMatch(/^[a-f0-9]{64}$/);
});

test("verifyAdmin returns true for correct token", () => {
  const { code, admin_token } = createRoom();
  expect(verifyAdmin(code, admin_token)).toBe(true);
});

test("verifyAdmin returns false for wrong token", () => {
  const { code } = createRoom();
  expect(verifyAdmin(code, "wrong-token")).toBe(false);
});

test("verifyAdmin returns false for null/undefined token", () => {
  const { code } = createRoom();
  expect(verifyAdmin(code, null)).toBe(false);
  expect(verifyAdmin(code, undefined)).toBe(false);
  expect(verifyAdmin(code, "")).toBe(false);
});

test("verifyAdmin returns false for nonexistent room", () => {
  expect(verifyAdmin("zzzzzz", "any-token")).toBe(false);
});

test("resetAdminToken generates a new token and invalidates old one", () => {
  const { code, admin_token } = createRoom();
  const newToken = resetAdminToken(code);
  expect(newToken).toBeDefined();
  expect(newToken).not.toBe(admin_token);
  expect(verifyAdmin(code, newToken!)).toBe(true);
  expect(verifyAdmin(code, admin_token)).toBe(false);
});

// ── Room Password Tests ────────────────────────────────────────────────────

test("room starts with no password (public)", () => {
  const { code } = createRoom();
  // No password set = anyone can access
  expect(verifyRoomPassword(code, "anything")).toBe(true);
});

test("setRoomPassword + verifyRoomPassword round-trip", () => {
  const { code } = createRoom();
  setRoomPassword(code, "my-secret-password");
  expect(verifyRoomPassword(code, "my-secret-password")).toBe(true);
  expect(verifyRoomPassword(code, "wrong-password")).toBe(false);
});

test("setRoomPassword with null removes password", () => {
  const { code } = createRoom();
  setRoomPassword(code, "temp-password");
  expect(verifyRoomPassword(code, "wrong")).toBe(false);
  setRoomPassword(code, null);
  expect(verifyRoomPassword(code, "anything")).toBe(true);
});

test("verifyRoomPassword returns false for nonexistent room", () => {
  expect(verifyRoomPassword("zzzzzz", "pass")).toBe(false);
});
