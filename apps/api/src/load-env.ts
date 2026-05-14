import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";

function findRootEnvPath(): string | undefined {
  const candidates: string[] = [];

  let current = process.cwd();
  for (let depth = 0; depth < 8; depth += 1) {
    candidates.push(resolve(current, ".env"));
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  candidates.push(resolve(__dirname, "../../../.env"));
  candidates.push(resolve(__dirname, "../../../../.env"));

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      return envPath;
    }
  }

  return undefined;
}

const envPath = findRootEnvPath();
if (envPath) {
  config({ path: envPath, override: false });
}
