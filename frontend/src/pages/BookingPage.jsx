import { useEffect, useMemo, useState } from "react";
import {
  fetchAvailability,
  quoteBooking,
  createBooking,
  fetchBookings
} from "../services/api.js";
import PriceBreakdown from "../components/PriceBreakdown.jsx";

const defaultStart = "18:00";
const defaultEnd = "19:00";

export default function BookingPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: defaultStart,
    endTime: defaultEnd,
    userName: "",
    userContact: ""
  });
  const [availability, setAvailability] = useState({ courts: [], coaches: [], equipment: [] });
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedCoach, setSelectedCoach] = useState("");
  const [equipmentItems, setEquipmentItems] = useState([]);
  const [price, setPrice] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");

  const loadAvailability = async () => {
    if (!form.date || !form.startTime || !form.endTime) return;
    const data = await fetchAvailability({ date: form.date, startTime: form.startTime, endTime: form.endTime });
    setAvailability(data);
    setSelectedCourt((prev) => data.courts.find((c) => c.id === prev && c.available)?.id || "");
    setSelectedCoach((prev) => data.coaches.find((c) => c.id === prev && c.available)?.id || "");
  };

  const loadBookings = async () => {
    const data = await fetchBookings();
    setBookings(data.slice().reverse());
  };

  const refreshPrice = async (nextEquipment) => {
    if (!selectedCourt) return;
    const payload = {
      ...form,
      courtId: selectedCourt,
      coachId: selectedCoach || null,
      equipmentItems: nextEquipment ?? equipmentItems
    };
    const breakdown = await quoteBooking(payload);
    setPrice(breakdown);
  };

  useEffect(() => {
    loadAvailability();
  }, [form.date, form.startTime, form.endTime]);

  useEffect(() => {
    if (selectedCourt) refreshPrice();
  }, [selectedCourt, selectedCoach]);

  useEffect(() => {
    loadBookings();
  }, []);

  const toggleEquipment = (id, qty) => {
    const next = [...equipmentItems];
    const idx = next.findIndex((e) => e.equipmentId === id);
    if (qty === 0) {
      if (idx >= 0) next.splice(idx, 1);
    } else if (idx >= 0) {
      next[idx].quantity = qty;
    } else {
      next.push({ equipmentId: id, quantity: qty });
    }
    setEquipmentItems(next);
    refreshPrice(next);
  };

  const availableCourts = useMemo(() => availability.courts?.filter((c) => c.available) || [], [availability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const payload = {
        ...form,
        courtId: selectedCourt,
        coachId: selectedCoach || null,
        equipmentItems
      };
      const booking = await createBooking(payload);
      setStatus(`Booking confirmed: ${booking.id}`);
      setPrice(booking.price);
      setForm((f) => ({ ...f, userName: f.userName, userContact: f.userContact }));
      loadBookings();
      loadAvailability();
    } catch (err) {
      setStatus(err.response?.data?.error || "Failed to book");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-4 lg:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold">Book a court</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Date</span>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Start</span>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">End</span>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </label>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Select court</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableCourts.map((court) => (
                <button
                  type="button"
                  key={court.id}
                  onClick={() => setSelectedCourt(court.id)}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedCourt === court.id ? "border-primary bg-teal-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">{court.name}</span>
                    <span className="text-xs uppercase text-slate-500">{court.type}</span>
                  </div>
                  <div className="text-sm text-slate-600">${court.baseRate}/hr</div>
                </button>
              ))}
              {!availableCourts.length ? <p className="text-sm text-slate-500">No courts free for this slot.</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-slate-600 mb-2">Equipment (optional)</p>
              <div className="space-y-2">
                {availability.equipment?.map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div>
                      <p className="font-semibold">{eq.name}</p>
                      <p className="text-xs text-slate-500">{eq.available} available · ${eq.rentalFee}/hr</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={eq.available}
                      className="w-20 border rounded px-2 py-1"
                      value={equipmentItems.find((e) => e.equipmentId === eq.id)?.quantity || 0}
                      onChange={(e) => toggleEquipment(eq.id, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Coach (optional)</p>
              <div className="space-y-2">
                {availability.coaches?.map((coach) => (
                  <button
                    type="button"
                    key={coach.id}
                    disabled={!coach.available}
                    onClick={() => setSelectedCoach((prev) => (prev === coach.id ? "" : coach.id))}
                    className={`w-full text-left border rounded-lg p-3 transition ${
                      selectedCoach === coach.id ? "border-accent bg-orange-50" : "border-slate-200"
                    } ${coach.available ? "" : "opacity-50"}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">{coach.name}</span>
                      <span className="text-xs text-slate-500">${coach.hourlyRate}/hr</span>
                    </div>
                    <p className="text-xs text-slate-500">{coach.bio}</p>
                    <p className="text-xs text-slate-500">{coach.available ? "Available" : "Unavailable"}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Your name</span>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                placeholder="Player name"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Contact</span>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.userContact}
                onChange={(e) => setForm({ ...form, userContact: e.target.value })}
                placeholder="Email or phone"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Status: {status || "—"}</div>
            <button className="btn-primary" type="submit" disabled={!selectedCourt}>
              Confirm booking
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <PriceBreakdown price={price} />
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold">Booking history</h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {bookings.map((b) => (
              <div key={b.id} className="border rounded-lg p-2">
                <div className="flex justify-between text-sm">
                  <span>{b.date} {b.startTime}-{b.endTime}</span>
                  <span className="text-slate-500">{b.status}</span>
                </div>
                <div className="text-sm text-slate-600">{b.userName} · {b.courtId}</div>
                <div className="text-sm font-semibold">${b.price?.total?.toFixed(2)}</div>
              </div>
            ))}
            {!bookings.length && <p className="text-sm text-slate-500">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
