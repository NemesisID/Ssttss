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
}) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    new Date().toISOString(),
    data.nama,
    `'${data.npm}`, // Tambahkan kutip agar tidak dibaca sebagai angka
    data.prodi,
    data.email,
    `'${data.noWhatsapp}`, // Tambahkan kutip agar 0 di awal tidak hilang
    data.divisions.join(", "),
    data.plan,
    data.paymentStatus,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:I",
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
