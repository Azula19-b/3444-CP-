import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export class JsonUserStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async readAll() {
    try {
      const contents = await fs.readFile(this.filePath, "utf8");
      const users = JSON.parse(contents);

      if (!Array.isArray(users)) {
        throw new Error("User data must be a JSON array.");
      }

      return users;
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }

      // Corrupt account data must be surfaced. Treating it as an empty list could
      // allow duplicate registrations and overwrite recoverable local data.
      throw error;
    }
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    const users = await this.readAll();
    return users.find((user) => user.email.toLowerCase() === normalizedEmail);
  }

  async create({ name, email, passwordHash }) {
    const users = await this.readAll();
    const user = {
      id: randomUUID(),
      name,
      email,
      password: passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(users, null, 2)}\n`, {
      mode: 0o600,
    });
    await fs.rename(temporaryPath, this.filePath);
    return user;
  }
}
