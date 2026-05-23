export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-slate-400 mb-6">Halaman tidak ditemukan</p>
        <a
          href="/open-recruitment"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Kembali ke Pendaftaran
        </a>
      </div>
    </main>
  );
}
