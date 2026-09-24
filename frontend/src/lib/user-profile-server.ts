import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  HealthProfile,
  OnboardingData,
  UserProfilePayload,
} from "@/lib/profile-types";
import type { UserStatus } from "@/lib/types";

export type { UserProfilePayload } from "@/lib/profile-types";

function asObject<T>(value: unknown): T | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  return null;
}

function asStatus(value: string | null | undefined): UserStatus | null {
  if (value === "pregnant" || value === "not_pregnant" || value === "planning") {
    return value;
  }
  return null;
}

export async function getUserProfile(userId: string): Promise<UserProfilePayload | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    status: asStatus(user.status),
    onboarding: asObject<OnboardingData>(user.onboardingJson),
    healthProfile: asObject<HealthProfile>(user.healthProfileJson),
    checklist: asObject<Record<string, string>>(user.checklistJson),
  };
}

export async function saveUserProfile(
  userId: string,
  data: {
    name?: string;
    status?: UserStatus | null;
    onboarding?: OnboardingData | null;
    healthProfile?: HealthProfile | null;
    checklist?: Record<string, string> | null;
  }
): Promise<UserProfilePayload | null> {
  const update: Prisma.UserUpdateInput = {};

  if (typeof data.name === "string" && data.name.trim()) {
    update.name = data.name.trim();
  }
  if (data.status !== undefined) {
    update.status = data.status;
  }
  if (data.onboarding !== undefined) {
    update.onboardingJson =
      data.onboarding === null ? Prisma.DbNull : (data.onboarding as Prisma.InputJsonValue);
  }
  if (data.healthProfile !== undefined) {
    update.healthProfileJson =
      data.healthProfile === null
        ? Prisma.DbNull
        : (data.healthProfile as Prisma.InputJsonValue);
  }
  if (data.checklist !== undefined) {
    update.checklistJson =
      data.checklist === null ? Prisma.DbNull : (data.checklist as Prisma.InputJsonValue);
  }

  if (Object.keys(update).length === 0) {
    return getUserProfile(userId);
  }

  await prisma.user.update({ where: { id: userId }, data: update });
  return getUserProfile(userId);
}
