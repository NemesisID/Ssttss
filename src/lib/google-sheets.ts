import { google } from "googleapis";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendToSheet(data: {
  registrationType?: string;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
  divisions: string[];
  plan: string;
  paymentProofUrl?: string | null;
  merchChoice?: string | null;
}) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const planLabel = data.plan === "PAID" ? "Berbayar" : data.plan === "FREE" ? "Gratis" : data.plan === "PAID_REG" ? "Pendaftaran Umum" : data.plan;

  const row = [
    new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).replace(/\./g, ":"),
    data.registrationType === "UMUM" ? "Umum" : "Mahasiswa",
    data.nama,
    data.npm && data.npm !== "-" ? `'${data.npm}` : "-",
    (data.prodi && data.prodi !== "-") ? data.prodi.replace(/_/g, " ") : "-",
    data.email,
    `'${data.noWhatsapp}`, // Tambahkan kutip agar 0 di awal tidak hilang
    data.divisions.join(", "),
    planLabel,
    data.paymentProofUrl ? `https://iscom.islab.web.id${data.paymentProofUrl}` : "-",
    data.merchChoice || "-",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}


export async function syncAllToSheet(registrations: {
  createdAt: Date;
  registrationType?: string;
  nama: string;
  npm: string | null;
  prodi: string | null;
  email: string;
  noWhatsapp: string;
  divisions: { division: string }[];
  plan: string;
  paymentProofUrl?: string | null;
  merchChoice?: string | null;
}[]) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Header row
  const header = [
    "Timestamp", "Tipe", "Nama", "NPM", "Program Studi", "Email",
    "No WhatsApp", "Divisi", "Plan", "Bukti Pembayaran", "Merchandise",
  ];

  const rows = registrations.map((r) => {
    const planLabel = r.plan === "PAID" ? "Berbayar" : r.plan === "FREE" ? "Gratis" : r.plan === "PAID_REG" ? "Pendaftaran Umum" : r.plan;
    return [
      new Date(r.createdAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(/\./g, ":"),
      (r.registrationType ?? "MAHASISWA") === "UMUM" ? "Umum" : "Mahasiswa",
      r.nama,
      r.npm ? `'${r.npm}` : "-",
      r.prodi ? r.prodi.replace(/_/g, " ") : "-",
      r.email,
      `'${r.noWhatsapp}`,
      r.divisions.map((d) => d.division.replace(/_/g, " ")).join(", "),
      planLabel,
      r.paymentProofUrl ? `https://iscom.islab.web.id${r.paymentProofUrl}` : "-",
      r.merchChoice || "-",
    ];
  });

  // Clear the entire sheet first
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Sheet1",
  });

  // Write header + all rows
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [header, ...rows] },
  });
}

