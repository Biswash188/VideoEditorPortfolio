import dotenv from "dotenv";
import crypto from "node:crypto";
import readline from "node:readline";

dotenv.config({ path: ".env.local" });

const email = process.env.ADMIN_EMAIL;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;

if (!email || !passwordHash) {
  console.log("ADMIN_EMAIL or ADMIN_PASSWORD_HASH is missing.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the admin email you use to log in: ", (enteredEmail) => {
  rl.question("Enter the admin password: ", async (enteredPassword) => {
    rl.close();

    const emailMatches =
      enteredEmail.trim().toLowerCase() === email.trim().toLowerCase();

    try {
      const [algorithm, cost, blockSize, parallelization, salt, hash] =
        passwordHash.split("$");

      if (algorithm !== "scrypt" || !salt || !hash) {
        console.log("Password hash format is invalid.");
        return;
      }

      const expected = Buffer.from(hash, "base64url");

      const derived = await new Promise((resolve, reject) => {
        crypto.scrypt(
          enteredPassword,
          Buffer.from(salt, "base64url"),
          expected.length,
          {
            N: Number(cost),
            r: Number(blockSize),
            p: Number(parallelization),
            maxmem: 128 * 1024 * 1024,
          },
          (error, key) => (error ? reject(error) : resolve(key))
        );
      });

      const passwordMatches =
        expected.length === derived.length &&
        crypto.timingSafeEqual(expected, derived);

      console.log("\n--- Admin credential test ---");
      console.log("Email matches:", emailMatches);
      console.log("Password matches:", passwordMatches);
      console.log(
        "Overall:",
        emailMatches && passwordMatches ? "VALID" : "INVALID"
      );
    } catch (error) {
      console.log("Password verification error:", error.message);
    }
  });
});