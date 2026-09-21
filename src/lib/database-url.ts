import path from "node:path";

export function sqlitePath(): string {
  return path.join(process.cwd(), "prisma", "dev.db");
}

export function sqliteUrl(): string {
  return `file:${sqlitePath()}`;
}
