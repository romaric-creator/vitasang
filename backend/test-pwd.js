const bcrypt = require("bcryptjs");

const testPasswords = [
  "Password123!",
  "admin123",
  "password123",
  "Amélie",
  "Cissé",
  "vitasang123",
  "Admin123",
];

const hash = "$2b$10$AnjHfQtHNCVCFH1s73zWlOL91aW/ei77FrcDEO6mfMmVntdVGBtOK";

async function test() {
  console.log("Testing passwords against hash...");
  for (const pwd of testPasswords) {
    try {
      const isMatch = await bcrypt.compare(pwd, hash);
      console.log(`"${pwd}": ${isMatch ? "✅ MATCH!" : "❌ no"}`);
    } catch (err) {
      console.log(`Error testing "${pwd}": ${err.message}`);
    }
  }
}

test().catch(console.error);
