export type PregnancyPlan = "soon" | "later";
export type SexFrequency = "rare" | "regular";
export type PartnersCount = "one" | "multiple";

export interface ContraceptionInput {
  estrogen_contraindications: boolean;
  gave_birth: boolean;
  pregnancy_plan: PregnancyPlan;
  sex_frequency: SexFrequency;
  long_term_ready: boolean;
  symptoms: boolean;
  partners: PartnersCount;
  sti_test: boolean;
}

export interface ContraceptionResult {
  primary_method: string;
  secondary_method: string;
  condom_required: boolean;
}

export function calculateContraceptionMethod(
  input: ContraceptionInput
): ContraceptionResult {
  let primary: string;
  let secondary: string;

  if (input.estrogen_contraindications) {
    if (input.long_term_ready) {
      primary = "Гормональная внутриматочная спираль";
      secondary = "Имплант";
    } else {
      primary = "Мини-пили";
      secondary = "Презерватив";
    }
  } else if (input.pregnancy_plan === "soon") {
    if (input.sex_frequency === "rare") {
      primary = "Презерватив";
      secondary = "Спермициды";
    } else {
      primary = "Комбинированные оральные контрацептивы";
      secondary = "Вагинальное кольцо";
    }
  } else {
    if (input.long_term_ready) {
      primary = "Гормональная внутриматочная спираль";
      secondary = "Имплант";
    } else {
      primary = "Комбинированные оральные контрацептивы";
      secondary = "Трансдермальный пластырь";
    }
  }

  if (input.symptoms) {
    if (!input.estrogen_contraindications) {
      primary = "Комбинированные оральные контрацептивы";
      secondary = "Гормональная внутриматочная спираль";
    } else {
      primary = "Гормональная внутриматочная спираль";
      secondary = "Мини-пили";
    }
  }

  const condom_required =
    input.partners === "multiple" || !input.sti_test;

  return {
    primary_method: primary,
    secondary_method: secondary,
    condom_required,
  };
}
