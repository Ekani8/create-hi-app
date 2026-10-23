import { z } from "zod";
import { normalizeEmail } from "../domain/user.rules";

export interface UserRepository {
  create(email: string): Promise<{ id: string; email: string }>;
}
const input = z.object({ email: z.string().trim().email() });
export async function createUser(repository: UserRepository, value: unknown) {
  return repository.create(normalizeEmail(input.parse(value).email));
}
