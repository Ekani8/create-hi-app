import { expect, it, vi } from "vitest";
import { createUser } from "./create-user";
it("normalizes valid input before persistence", async () => {
  const create = vi.fn(async (email: string) => ({ id: "1", email }));
  await expect(
    createUser({ create }, { email: " User@Example.COM " }),
  ).resolves.toEqual({ id: "1", email: "user@example.com" });
  expect(create).toHaveBeenCalledWith("user@example.com");
});
it("rejects invalid input without writing", async () => {
  const create = vi.fn();
  await expect(createUser({ create }, { email: "invalid" })).rejects.toThrow();
  expect(create).not.toHaveBeenCalled();
});
