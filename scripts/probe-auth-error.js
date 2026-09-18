/**
 * Probe sementara untuk CLIENT_FETCH_ERROR /api/auth/session (HTML instead of JSON).
 * Jalankan: node scripts/probe-auth-error.js [baseURL]
 * Hapus file ini setelah selesai.
 */
const path = require("path");
const fs = require("fs");

async function main() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer-core");
  } catch {
    console.log("puppeteer-core belum terpasang. Jalankan:");
    console.log("  npm i --no-save puppeteer-core");
    process.exit(2);
  }

  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ];
  const executablePath = candidates.find((p) => fs.existsSync(p));
  if (!executablePath) {
    console.log("Edge/Chrome tidak ditemukan");
    process.exit(2);
  }

  const base = process.argv[2] || "http://localhost:3000";
  const browser = await puppeteer.launch({ headless: "new", executablePath });
  const page = await browser.newPage();

  const responses = [];
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/api/auth")) {
      responses.push({
        status: r.status(),
        url: u,
        contentType: (r.headers()["content-type"] || "").slice(0, 40),
        fromServiceWorker: r.fromServiceWorker && r.fromServiceWorker(),
      });
    }
  });
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
  });

  await page.goto(base + "/dash/login", { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 4000));

  console.log("--- /api/auth responses ---");
  for (const r of responses) console.log(JSON.stringify(r));
  console.log("--- console errors ---");
  for (const e of consoleErrors.slice(0, 5)) console.log(e);

  // Simpan body respons sesi persis seperti yang diterima browser
  const sessionBody = await page.evaluate(async () => {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    const text = await res.text();
    return { status: res.status, contentType: res.headers.get("content-type"), first: text.slice(0, 200) };
  });
  console.log("--- in-page refetch ---");
  console.log(JSON.stringify(sessionBody));

  await browser.close();
}

main().catch((e) => {
  console.error("probe failed:", e.message);
  process.exit(1);
});
