import { z } from "zod";

export const personalInfoSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .min(3, "Nama terlalu pendek, minimal 3 karakter")
    .max(255),
  npm: z
    .string()
    .min(1, "NPM wajib diisi")
    .regex(/^\d{8,20}$/, "Format NPM salah, harus angka 8-20 digit"),
  prodi: z.enum(["INFORMATIKA", "SISTEM_INFORMASI", "SAINS_DATA", "BISNIS_DIGITAL"], {
    errorMap: () => ({ message: "Program studi wajib dipilih" }),
  }),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .regex(/@student\.upnjatim\.ac\.id$/, "Gunakan email kampus @student.upnjatim.ac.id"),
  noWhatsapp: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .regex(/^(08|\+628)\d{8,13}$/, "Format nomor salah, contoh: 08123456789"),
});

export const divisionSchema = z.object({
  divisions: z
    .array(z.enum(["PROGRAMMING", "DATA", "BUSINESS_PLAN", "UI_UX"]))
    .min(1, "Pilih minimal 1 divisi"),
});

export const planSchema = z.object({
  plan: z.enum(["FREE", "PAID"], {
    errorMap: () => ({ message: "Pilih salah satu plan" }),
  }),
});

export const registrationSchema = personalInfoSchema
  .merge(divisionSchema)
  .merge(planSchema);

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
