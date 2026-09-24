import type { UserStatus } from "@/lib/types";

export interface LabTests {
  blood_general: boolean;
  urine_general: boolean;
  biochemistry: boolean;
  iron_ferritin: boolean;
  vitamin_d: boolean;
  hormones: boolean;
  pap_test: boolean;
  hpv: boolean;
}

export interface AttachedFileMeta {
  name: string;
  size: number;
  type: string;
  addedAt: string;
}

export interface OnboardingData {
  status?: string;
  age?: string;
  height?: string;
  weight?: string;
  hadPregnancy?: boolean | null;
  pregnancyCount?: string | null;
  hadBirths?: boolean | null;
  birthsCount?: string | null;
  hadAbortions?: boolean | null;
  abortionsCount?: string | null;
  periodDays?: string[];
  regularCycle?: boolean | null;
  painLevel?: number;
  flowType?: string;
  cycleDay?: string;
  lastUltrasound?: string;
  lastGynVisit?: string;
  neverUltrasound?: boolean;
  pregnancySource?: string;
  anchorDate?: string;
  pregnancyWeek?: string;
  pregnancyDay?: string;
  dueDate?: string;
}

export interface HealthProfile {
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  chronic?: string;
  lastGynVisit?: string;
  neverGynVisit?: boolean;
  lastPelvicUltrasound?: string;
  neverPelvicUltrasound?: boolean;
  hadComplaints?: boolean | null;
  hadTreatment?: boolean | null;
  complaintsAndTreatment?: string;
  lastTherapistVisit?: string;
  neverTherapistVisit?: boolean;
  therapistNotes?: string;
  labTests?: LabTests;
  attachedFiles?: AttachedFileMeta[];
}

export interface UserProfilePayload {
  name: string;
  email: string;
  status: UserStatus | null;
  onboarding: OnboardingData | null;
  healthProfile: HealthProfile | null;
  checklist: Record<string, string> | null;
}
