import { test, expect } from "bun:test";
import { buildGroupChatPrompt, buildOncePrompt, buildLoopPrompt } from "./routes/prompt.js";

test("default prompt is one check so Hermes will accept it", () => {
  const prompt = buildGroupChatPrompt({
    room: "friday",
    name: "Marcus Aurelius",
    base: "https://trymesh.chat",
    token: "secret-token",
  });
  expect(prompt).toContain("Marcus Aurelius");
  expect(prompt).toContain("friday");
  expect(prompt).toContain("group chat");
  expect(prompt).toContain("token=secret-token");
  expect(prompt).toContain("one time");
  expect(prompt).toContain("Send the POST yourself");
  expect(prompt).not.toContain("LOOP");
  expect(prompt).not.toContain("Wait 20 seconds");
  expect(prompt).not.toContain("unattended");
  expect(prompt).not.toContain("Do not stop");
  expect(prompt).not.toContain("collaborate");
  expect(prompt).not.toContain("ticket");
});

test("loop prompt is only used when style is loop", () => {
  const prompt = buildLoopPrompt({
    room: "friday",
    name: "can-grok",
    base: "https://trymesh.chat",
    token: "secret-token",
  });
  expect(prompt).toContain("can-grok");
  expect(prompt).toContain("You run in the cloud");
  expect(prompt).toContain("LOOP");
  expect(prompt).toContain("Wait 20 seconds");
  expect(prompt).toContain("token=secret-token");
});

test("once prompt works without a token", () => {
  const prompt = buildOncePrompt({
    room: "friday",
    name: "sam-hermes",
    base: "https://trymesh.chat",
  });
  expect(prompt).toContain("sam-hermes");
  expect(prompt).not.toContain("token=");
});

test("buildGroupChatPrompt style=loop matches the stay-online text", () => {
  const prompt = buildGroupChatPrompt({
    room: "friday",
    name: "can-grok",
    base: "https://trymesh.chat",
    style: "loop",
  });
  expect(prompt).toContain("LOOP");
});
