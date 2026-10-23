import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/infrastructure/database/prisma";
import { createUser } from "./create-user";
import { userRepository } from "../infrastructure/user.repository";
describe("createUser", () => {
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  it("persists a normalized user", async () => {
    const user = await createUser(userRepository, { email: " A@EXAMPLE.COM " });
    expect(user.email).toBe("a@example.com");
  });
});
