import { useState } from "react";
import BookingPage from "./pages/BookingPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

const tabs = [
  { id: "book", label: "Book" },
  { id: "admin", label: "Admin" }
];

export default function App() {
  const [tab, setTab] = useState("book");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-ink">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary text-white grid place-items-center font-bold">SB</div>
            <div>
              <p className="font-semibold">SmashBook</p>
              <p className="text-xs text-slate-500">Badminton court & coaching</p>
            </div>
          </div>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === t.id ? "bg-primary text-white" : "btn-ghost"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "book" ? <BookingPage /> : <AdminPage />}
      </main>
    </div>
  );
}
