import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  createSessionToken,
  getSessionFromCookies,
  type SessionPayload,
} from "@/lib/session";

const BCRYPT_ROUNDS = 12;

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new AuthError(
      "База данных не настроена. Задайте DATABASE_URL на сервере.",
      503
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ session: SessionPayload; token: string }> {
  await requireDatabase();

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!name) throw new AuthError("Введите имя");
  if (password.length < 6) {
    throw new AuthError("Пароль должен быть не менее 6 символов");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("Аккаунт с таким email уже существует. Войдите.", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  const token = await createSessionToken(session);
  return { session, token };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ session: SessionPayload; token: string }> {
  await requireDatabase();

  const email = input.email.trim().toLowerCase();
  if (/[^\x00-\x7F]/.test(email)) {
    throw new AuthError("Неверный email или пароль", 401);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("Неверный email или пароль", 401);
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError("Неверный email или пароль", 401);
  }

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  const token = await createSessionToken(session);
  return { session, token };
}

export async function resetUserPassword(input: {
  email: string;
  password: string;
}): Promise<void> {
  await requireDatabase();

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (password.length < 6) {
    throw new AuthError("Пароль должен быть не менее 6 символов");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("Не удалось сменить пароль", 400);
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new AuthError("Войдите в аккаунт", 401);
  }
  return session;
}
