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
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
  divisions: string[];
  plan: string;
  paymentStatus: string;
  paymentProofUrl?: string | null;
}) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

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
    data.nama,
    `'${data.npm}`, // Tambahkan kutip agar tidak dibaca sebagai angka
    data.prodi.replace(/_/g, " "),
    data.email,
    `'${data.noWhatsapp}`, // Tambahkan kutip agar 0 di awal tidak hilang
    data.divisions.join(", "),
    data.plan,
    data.paymentStatus,
    data.paymentProofUrl || "-",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:J",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function updateSheetPaymentStatus(npm: string, status: string) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!C:C",
  });

  const rows = response.data.values;
  if (!rows) return;

  const rowIndex = rows.findIndex((row) => row[0] === npm);
  if (rowIndex === -1) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!I${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  });
}

export async function syncAllToSheet(registrations: {
  createdAt: Date;
  nama: string;
  npm: string;
  prodi: string;
  email: string;
  noWhatsapp: string;
  divisions: { division: string }[];
  plan: string;
  paymentStatus: string;
  paymentProofUrl?: string | null;
}[]) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Header row (same columns as detail page)
  const header = [
    "Timestamp", "Nama", "NPM", "Program Studi", "Email",
    "No WhatsApp", "Divisi", "Plan", "Status", "Bukti Pembayaran",
  ];

  const rows = registrations.map((r) => [
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
    r.nama,
    `'${r.npm}`,
    r.prodi.replace(/_/g, " "),
    r.email,
    `'${r.noWhatsapp}`,
    r.divisions.map((d) => d.division.replace(/_/g, " ")).join(", "),
    r.plan,
    r.paymentStatus,
    r.paymentProofUrl || "-",
  ]);

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
