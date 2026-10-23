import { createUser } from "./application/create-user";
import { userRepository } from "./infrastructure/user.repository";

export const userServices = {
  create: (input: unknown) => createUser(userRepository, input),
};
