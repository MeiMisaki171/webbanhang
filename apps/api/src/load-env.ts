import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
  resolve(__dirname, "../../../.env"),
  resolve(__dirname, "../../../../.env"),
];

for (const envPath of envPaths) {
  if (!existsSync(envPath)) {
    continue;
  }

  config({ path: envPath, override: false });
  break;
}
