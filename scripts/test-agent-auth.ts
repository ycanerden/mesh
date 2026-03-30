import { generateAgentToken, verifyAgentToken, canAgentSend, createRoom, getRoomContext, setRoomContext } from "../src/rooms";

async function test() {
  console.log("🚀 Testing Agent Auth & Shared Context (SQLite-native)...");

  // 1. Create a room
  const { code, admin_token } = createRoom();
  console.log(`✅ Created room: ${code} (admin_token: ${admin_token})`);

  const agentName = "TestAgent";

  // 2. Initially, canAgentSend should be true (no token set)
  const allowedInitial = canAgentSend(code, agentName);
  console.log(`Initial canAgentSend (no token set): ${allowedInitial} (expected: true)`);
  if (!allowedInitial) throw new Error("Should be allowed initially");

  // 3. Generate an agent token
  const token = generateAgentToken(code, agentName);
  console.log(`✅ Generated agent token: ${token}`);

  // 4. Verify the token directly
  const verified = verifyAgentToken(code, agentName, token);
  console.log(`verifyAgentToken (correct token): ${verified} (expected: true)`);
  if (!verified) throw new Error("Token verification failed");

  // 5. canAgentSend should now FAIL without token
  const allowedNoToken = canAgentSend(code, agentName);
  console.log(`canAgentSend (no token provided): ${allowedNoToken} (expected: false)`);
  if (allowedNoToken) throw new Error("Should NOT be allowed without token now");

  // 6. canAgentSend should now SUCCEED with CORRECT token
  const allowedCorrectToken = canAgentSend(code, agentName, token);
  console.log(`canAgentSend (correct token provided): ${allowedCorrectToken} (expected: true)`);
  if (!allowedCorrectToken) throw new Error("Should be allowed with correct token");

  // 7. Test Shared Context
  console.log("\n📍 Testing Shared Context...");
  const initialContext = getRoomContext(code);
  console.log(`Initial context: ${JSON.stringify(initialContext)} (expected: null)`);
  if (initialContext !== null) throw new Error("Initial context should be null");

  const newContext = "Project Goal: Build the ultimate agent mesh.";
  setRoomContext(code, newContext, agentName);
  console.log(`✅ Set room context as ${agentName}`);

  const updatedContext = getRoomContext(code);
  console.log(`Updated context: ${JSON.stringify(updatedContext)}`);
  if (!updatedContext || updatedContext.content !== newContext) throw new Error("Context mismatch");
  if (updatedContext.updated_by !== agentName) throw new Error("Last updated by mismatch");

  console.log("✅ All tests passed!");
}

test().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
