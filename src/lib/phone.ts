/**
 * Normalisasi nomor WhatsApp agar bisa dicocokkan:
 * +6281234 -> 081234, 6281234 -> 081234, 081234 -> 081234
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+62")) cleaned = "0" + cleaned.slice(3);
  else if (cleaned.startsWith("62")) cleaned = "0" + cleaned.slice(2);
  return cleaned;
}
