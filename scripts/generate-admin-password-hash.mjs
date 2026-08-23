import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const prompt = createInterface({ input: stdin, output: stdout });
const password = await prompt.question("New admin password (12+ characters): ");
prompt.close();

if (password.length < 12) throw new Error("Use a password with at least 12 characters.");

const salt = randomBytes(16);
const cost = 16_384;
const blockSize = 8;
const parallelization = 1;
const hash = await new Promise((resolve, reject) => scrypt(password, salt, 64, { N: cost, r: blockSize, p: parallelization, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));

console.log(`\nADMIN_PASSWORD_HASH=scrypt$${cost}$${blockSize}$${parallelization}$${salt.toString("base64url")}$${hash.toString("base64url")}`);
