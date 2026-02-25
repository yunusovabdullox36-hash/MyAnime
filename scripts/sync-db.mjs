import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const source = resolve(rootDir, "db.json");
const destination = resolve(rootDir, "public", "db.json");

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log("Synced db.json -> public/db.json");
