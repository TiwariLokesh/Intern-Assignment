import { useEffect, useState } from "react";
import {
  fetchCourts,
  fetchEquipment,
  fetchCoaches,
  fetchPricingRules,
  createCourt,
  createEquipment,
  createCoach,
  createPricingRule,
  updatePricingRule,
  updateCourt,
  updateEquipment,
  updateCoach
} from "../services/api.js";

const Section = ({ title, children }) => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatAvailability = (availability = []) => {
  if (!Array.isArray(availability) || availability.length === 0) return "No availability set";
  return availability
    .map((entry) => {
      const label = dayNames[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek}`;
      const slots = Array.isArray(entry.slots) ? entry.slots.join(", ") : "";
      return `${label}: ${slots}`;
    })
    .join(" · ");
};

export default function AdminPage() {
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [rules, setRules] = useState([]);
  const [creating, setCreating] = useState({});
  const [coachModal, setCoachModal] = useState(null);
  const [courtModal, setCourtModal] = useState(null);
  const [equipmentModal, setEquipmentModal] = useState(null);
  const [ruleModal, setRuleModal] = useState(null);
  const [newRule, setNewRule] = useState({
    name: "",
    type: "time",
    amount: 0,
    mode: "percent",
    startHour: 18,
    endHour: 21,
    daysOfWeek: "0,6",
    courtType: "indoor"
  });

  const load = async () => {
    const [c, e, co, pr] = await Promise.all([
      fetchCourts(),
      fetchEquipment(),
      fetchCoaches(),
      fetchPricingRules()
    ]);
    setCourts(c);
    setEquipment(e);
    setCoaches(co);
    setRules(pr);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (type, payload) => {
    setCreating((p) => ({ ...p, [type]: true }));
    try {
      if (type === "court") await createCourt(payload);
      if (type === "equipment") await createEquipment(payload);
      if (type === "coach") await createCoach(payload);
      if (type === "rule") await createPricingRule(payload);
      await load();
    } finally {
      setCreating((p) => ({ ...p, [type]: false }));
    }
  };

  const toggleRule = async (id, enabled) => {
    await updatePricingRule(id, { enabled });
    load();
  };

  const openCourtModal = (court) => {
    setCourtModal({
      id: court.id,
      name: court.name,
      baseRate: court.baseRate,
      status: court.status || "active"
    });
  };

  const saveCourtModal = async () => {
    if (!courtModal) return;
    await updateCourt(courtModal.id, {
      baseRate: Number(courtModal.baseRate),
      status: courtModal.status
    });
    await load();
    setCourtModal(null);
  };

  const openEquipmentModal = (item) => {
    setEquipmentModal({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      rentalFee: item.rentalFee
    });
  };

  const saveEquipmentModal = async () => {
    if (!equipmentModal) return;
    await updateEquipment(equipmentModal.id, {
      quantity: Number(equipmentModal.quantity),
      rentalFee: Number(equipmentModal.rentalFee)
    });
    await load();
    setEquipmentModal(null);
  };

  const openCoachModal = (coach) => {
    setCoachModal({
      id: coach.id,
      name: coach.name,
      hourlyRate: coach.hourlyRate,
      availabilityText: JSON.stringify(coach.availability || [], null, 2),
      active: coach.active !== false,
      error: ""
    });
  };

  const closeCoachModal = () => setCoachModal(null);

  const saveCoachEdit = async () => {
    if (!coachModal) return;
    let availability = [];
    try {
      availability = coachModal.availabilityText ? JSON.parse(coachModal.availabilityText) : [];
    } catch (err) {
      setCoachModal((p) => ({ ...p, error: "Invalid availability JSON" }));
      return;
    }
    await updateCoach(coachModal.id, {
      hourlyRate: Number(coachModal.hourlyRate),
      availability,
      active: coachModal.active
    });
    await load();
    closeCoachModal();
  };

  const openRuleModal = (rule) => {
    const criteria = rule.criteria || {};
    setRuleModal({
      id: rule.id,
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      mode: rule.mode,
      startHour: criteria.startHour ?? 0,
      endHour: criteria.endHour ?? 0,
      daysOfWeek: (criteria.daysOfWeek || []).join(","),
      courtType: criteria.courtType || "indoor"
    });
  };

  const saveRuleModal = async () => {
    if (!ruleModal) return;
    let criteria = {};
    if (ruleModal.type === "time") {
      criteria = { startHour: Number(ruleModal.startHour), endHour: Number(ruleModal.endHour) };
    }
    if (ruleModal.type === "day-of-week") {
      criteria = {
        daysOfWeek: (ruleModal.daysOfWeek || "")
          .split(",")
          .map((n) => Number(n.trim()))
          .filter((n) => !Number.isNaN(n))
      };
    }
    if (ruleModal.type === "court-type") {
      criteria = { courtType: ruleModal.courtType };
    }
    await updatePricingRule(ruleModal.id, {
      amount: Number(ruleModal.amount),
      mode: ruleModal.mode,
      criteria
    });
    await load();
    setRuleModal(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="Courts">
        <div className="space-y-2">
          {courts.map((c) => (
            <div key={c.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">{c.type} · ${c.baseRate}/hr · {c.status}</p>
              </div>
              <button className="btn-ghost text-xs" onClick={() => openCourtModal(c)}>Edit / Disable</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" id="courtName" />
          <select className="border rounded px-2 py-1" id="courtType">
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Rate" type="number" id="courtRate" />
        </div>
        <button
          className="btn-primary"
          disabled={creating.court}
          onClick={() =>
            onCreate("court", {
              name: document.getElementById("courtName").value,
              type: document.getElementById("courtType").value,
              baseRate: Number(document.getElementById("courtRate").value)
            })
          }
        >
          Add court
        </button>
      </Section>

      <Section title="Equipment">
        <div className="space-y-2">
          {equipment.map((e) => (
            <div key={e.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-slate-500">{e.quantity} units · ${e.rentalFee}/hr</p>
              </div>
              <button className="btn-ghost text-xs" onClick={() => openEquipmentModal(e)}>Edit</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" id="eqName" />
          <input className="border rounded px-2 py-1" placeholder="Qty" type="number" id="eqQty" />
          <input className="border rounded px-2 py-1" placeholder="Fee/hr" type="number" id="eqFee" />
        </div>
        <button
          className="btn-primary"
          disabled={creating.equipment}
          onClick={() =>
            onCreate("equipment", {
              name: document.getElementById("eqName").value,
              quantity: Number(document.getElementById("eqQty").value),
              rentalFee: Number(document.getElementById("eqFee").value)
            })
          }
        >
          Add equipment
        </button>
      </Section>

      <Section title="Coaches">
        <div className="space-y-2">
          {coaches.map((c) => (
            <div key={c.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">${c.hourlyRate}/hr · {c.active ? "Active" : "Inactive"}</p>
                <p className="text-xs text-slate-500">Availability: {formatAvailability(c.availability)}</p>
              </div>
              <div className="flex items-start justify-end w-56">
                <button className="btn-ghost text-xs" onClick={() => openCoachModal(c)}>Edit / Availability</button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" id="coachName" />
          <input className="border rounded px-2 py-1" placeholder="Rate/hr" type="number" id="coachRate" />
        </div>
        <button
          className="btn-primary"
          disabled={creating.coach}
          onClick={() =>
            onCreate("coach", {
              name: document.getElementById("coachName").value,
              hourlyRate: Number(document.getElementById("coachRate").value)
            })
          }
        >
          Add coach
        </button>
      </Section>

      <Section title="Pricing rules">
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-slate-500">{r.type} · {r.mode} · {r.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={r.enabled !== false}
                    onChange={() => toggleRule(r.id, !(r.enabled !== false))}
                  />
                  <span>{r.enabled !== false ? "Enabled" : "Disabled"}</span>
                </label>
                <button className="btn-ghost text-xs" onClick={() => openRuleModal(r)}>Edit</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Name"
            value={newRule.name}
            onChange={(e) => setNewRule((p) => ({ ...p, name: e.target.value }))}
          />
          <select
            className="border rounded px-2 py-1"
            value={newRule.type}
            onChange={(e) => setNewRule((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="time">time</option>
            <option value="day-of-week">day-of-week</option>
            <option value="court-type">court-type</option>
            <option value="equipment">equipment</option>
            <option value="coach">coach</option>
          </select>
          <input
            className="border rounded px-2 py-1"
            placeholder="Amount"
            type="number"
            value={newRule.amount}
            onChange={(e) => setNewRule((p) => ({ ...p, amount: Number(e.target.value) }))}
          />
          <select
            className="border rounded px-2 py-1"
            value={newRule.mode}
            onChange={(e) => setNewRule((p) => ({ ...p, mode: e.target.value }))}
          >
            <option value="percent">percent</option>
            <option value="flat">flat</option>
            <option value="flat-per-item">flat-per-item</option>
          </select>
          <input
            className="border rounded px-2 py-1"
            placeholder="Start hour"
            type="number"
            value={newRule.startHour}
            onChange={(e) => setNewRule((p) => ({ ...p, startHour: Number(e.target.value) }))}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="End hour"
            type="number"
            value={newRule.endHour}
            onChange={(e) => setNewRule((p) => ({ ...p, endHour: Number(e.target.value) }))}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Days (e.g. 0,6)"
            value={newRule.daysOfWeek}
            onChange={(e) => setNewRule((p) => ({ ...p, daysOfWeek: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Court type"
            value={newRule.courtType}
            onChange={(e) => setNewRule((p) => ({ ...p, courtType: e.target.value }))}
          />
        </div>

        <button
          className="btn-primary"
          disabled={creating.rule}
          onClick={() => {
            let criteria = {};
            if (newRule.type === "time") criteria = { startHour: newRule.startHour, endHour: newRule.endHour };
            if (newRule.type === "day-of-week") criteria = { daysOfWeek: newRule.daysOfWeek.split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n)) };
            if (newRule.type === "court-type") criteria = { courtType: newRule.courtType };
            if (newRule.type === "equipment") criteria = {};
            if (newRule.type === "coach") criteria = {};
            onCreate("rule", {
              name: newRule.name,
              type: newRule.type,
              amount: Number(newRule.amount),
              mode: newRule.mode,
              criteria
            });
          }}
        >
          Add rule
        </button>
      </Section>
      {coachModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Edit {coachModal.name}</h4>
              <button className="btn-ghost text-sm" onClick={closeCoachModal}>Close</button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Hourly rate</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                value={coachModal.hourlyRate}
                onChange={(e) => setCoachModal((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
              />
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={coachModal.active}
                  onChange={(e) => setCoachModal((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>{coachModal.active ? "Active" : "Inactive"}</span>
              </div>
              <label className="block text-xs font-semibold text-slate-600">Availability (JSON array)</label>
              <textarea
                className="border rounded px-3 py-2 w-full text-xs font-mono"
                rows={6}
                value={coachModal.availabilityText}
                onChange={(e) => {
                  const value = e.target.value;
                  let error = "";
                  try {
                    if (value) JSON.parse(value);
                  } catch (err) {
                    error = "Invalid JSON";
                  }
                  setCoachModal((p) => ({ ...p, availabilityText: value, error }));
                }}
                placeholder='[{"dayOfWeek":1,"slots":["07:00-11:00","17:00-20:00"]}]'
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Example: [{'{'}"dayOfWeek"{'}'}:1,"slots":["07:00-11:00","17:00-20:00"]}] — use 24h time.
              </p>
              {coachModal.error && <p className="text-[11px] text-red-600">{coachModal.error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={closeCoachModal}>Cancel</button>
              <button className="btn-primary" disabled={Boolean(coachModal.error)} onClick={saveCoachEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {courtModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Edit {courtModal.name}</h4>
              <button className="btn-ghost text-sm" onClick={() => setCourtModal(null)}>Close</button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Base rate (per hour)</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                value={courtModal.baseRate}
                onChange={(e) => setCourtModal((p) => ({ ...p, baseRate: Number(e.target.value) }))}
              />
              <label className="block text-xs font-semibold text-slate-600">Status</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={courtModal.status}
                onChange={(e) => setCourtModal((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setCourtModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveCourtModal}>Save</button>
            </div>
          </div>
        </div>
      )}

      {equipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Edit {equipmentModal.name}</h4>
              <button className="btn-ghost text-sm" onClick={() => setEquipmentModal(null)}>Close</button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Quantity</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                value={equipmentModal.quantity}
                onChange={(e) => setEquipmentModal((p) => ({ ...p, quantity: Number(e.target.value) }))}
              />
              <label className="block text-xs font-semibold text-slate-600">Fee per hour</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="number"
                value={equipmentModal.rentalFee}
                onChange={(e) => setEquipmentModal((p) => ({ ...p, rentalFee: Number(e.target.value) }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setEquipmentModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEquipmentModal}>Save</button>
            </div>
          </div>
        </div>
      )}

      {ruleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Edit rule: {ruleModal.name}</h4>
              <button className="btn-ghost text-sm" onClick={() => setRuleModal(null)}>Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600">Name</label>
                <input className="border rounded px-3 py-2 w-full" value={ruleModal.name} disabled />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Type</label>
                <input className="border rounded px-3 py-2 w-full" value={ruleModal.type} disabled />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Mode</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={ruleModal.mode}
                  onChange={(e) => setRuleModal((p) => ({ ...p, mode: e.target.value }))}
                >
                  <option value="percent">percent</option>
                  <option value="flat">flat</option>
                  <option value="flat-per-item">flat-per-item</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Amount</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="number"
                  value={ruleModal.amount}
                  onChange={(e) => setRuleModal((p) => ({ ...p, amount: Number(e.target.value) }))}
                />
              </div>

              {ruleModal.type === "time" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Start hour</label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      type="number"
                      value={ruleModal.startHour}
                      onChange={(e) => setRuleModal((p) => ({ ...p, startHour: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">End hour</label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      type="number"
                      value={ruleModal.endHour}
                      onChange={(e) => setRuleModal((p) => ({ ...p, endHour: Number(e.target.value) }))}
                    />
                  </div>
                </>
              )}

              {ruleModal.type === "day-of-week" && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Days of week (comma separated, 0=Sun)</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={ruleModal.daysOfWeek}
                    onChange={(e) => setRuleModal((p) => ({ ...p, daysOfWeek: e.target.value }))}
                  />
                </div>
              )}

              {ruleModal.type === "court-type" && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Court type</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={ruleModal.courtType}
                    onChange={(e) => setRuleModal((p) => ({ ...p, courtType: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setRuleModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveRuleModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
