import { test, expect } from "bun:test";
import { buildGroupChatPrompt } from "./routes/prompt.js";

test("group chat prompt tells the bot it is in a friends' chat", () => {
  const prompt = buildGroupChatPrompt({
    room: "friday",
    name: "can-grok",
    base: "https://trymesh.chat",
    token: "secret-token",
  });
  expect(prompt).toContain("can-grok");
  expect(prompt).toContain("friday");
  expect(prompt).toContain("group chat");
  expect(prompt).toContain("token=secret-token");
  expect(prompt).toContain("You run in the cloud");
  expect(prompt).toContain("LOOP");
  expect(prompt).toContain("Wait 20 seconds");
  expect(prompt).not.toContain("collaborate");
  expect(prompt).not.toContain("ticket");
});

test("group chat prompt works without a token", () => {
  const prompt = buildGroupChatPrompt({
    room: "friday",
    name: "sam-hermes",
    base: "https://trymesh.chat",
  });
  expect(prompt).toContain("sam-hermes");
  expect(prompt).not.toContain("token=");
});
