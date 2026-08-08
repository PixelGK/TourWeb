import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function derive(password: string, salt: Buffer, cost: number, blockSize: number, parallelization: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: cost, r: blockSize, p: parallelization, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashAdminPassword(password: string) {
  if (password.length < 14) throw new Error("Admin password must contain at least 14 characters");
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST, BLOCK_SIZE, PARALLELIZATION);
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, encoded: string) {
  const [algorithm, costText, blockSizeText, parallelizationText, saltText, keyText] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltText || !keyText) return false;
  const cost = Number(costText);
  const blockSize = Number(blockSizeText);
  const parallelization = Number(parallelizationText);
  if (cost !== COST || blockSize !== BLOCK_SIZE || parallelization !== PARALLELIZATION) return false;

  try {
    const expected = Buffer.from(keyText, "base64url");
    const actual = await derive(password, Buffer.from(saltText, "base64url"), cost, blockSize, parallelization);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
