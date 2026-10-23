import { prisma } from "@/infrastructure/database/prisma";
import type { UserRepository } from "../application/create-user";
export const userRepository: UserRepository = {
  create: (email) =>
    prisma.user.create({ data: { email }, select: { id: true, email: true } }),
};
