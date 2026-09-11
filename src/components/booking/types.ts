export type WizardService = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  imageUrl: string;
};

export type WizardProfessional = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  bio: string;
  photoUrl: string;
};

export type CustomerPrefill = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  marketingOptIn: boolean;
};

export const STEPS = [
  { key: "treatment", label: "Tratamiento" },
  { key: "professional", label: "Profesional" },
  { key: "date", label: "Fecha" },
  { key: "time", label: "Horario" },
  { key: "customer", label: "Tus datos" },
  { key: "confirm", label: "Confirmación" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
