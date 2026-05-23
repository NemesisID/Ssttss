import { z } from "zod";

export const personalInfoSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").max(255),
  npm: z.string().regex(/^\d{8,20}$/, "NPM harus berupa angka 8-20 digit"),
  prodi: z.enum(["INFORMATIKA", "SISTEM_INFORMASI", "SAINS_DATA", "BISNIS_DIGITAL"]),
  email: z
    .string()
    .email("Email tidak valid")
    .regex(/@student\.upnjatim\.ac\.id$/, "Harus menggunakan email @student.upnjatim.ac.id"),
  noWhatsapp: z
    .string()
    .regex(/^(08|\+628)\d{8,13}$/, "Nomor WhatsApp tidak valid"),
});

export const divisionSchema = z.object({
  divisions: z
    .array(z.enum(["PROGRAMMING", "DATA", "BUSINESS_PLAN", "UI_UX"]))
    .min(1, "Pilih minimal 1 divisi"),
});

export const planSchema = z.object({
  plan: z.enum(["FREE", "PAID"]),
});

export const registrationSchema = personalInfoSchema
  .merge(divisionSchema)
  .merge(planSchema);

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
