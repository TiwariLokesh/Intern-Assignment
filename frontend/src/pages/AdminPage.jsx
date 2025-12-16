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
  updatePricingRule
} from "../services/api.js";

const Section = ({ title, children }) => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

export default function AdminPage() {
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [rules, setRules] = useState([]);
  const [creating, setCreating] = useState({});

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
              <label className="flex items-center gap-2 text-sm">
                <span>{r.enabled ? "On" : "Off"}</span>
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => toggleRule(r.id, e.target.checked)}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Name" id="ruleName" />
          <input className="border rounded px-2 py-1" placeholder="Type (time/day-of-week)" id="ruleType" />
          <input className="border rounded px-2 py-1" placeholder="Amount" type="number" id="ruleAmount" />
          <select className="border rounded px-2 py-1" id="ruleMode">
            <option value="percent">percent</option>
            <option value="flat">flat</option>
            <option value="flat-per-item">flat-per-item</option>
          </select>
        </div>
        <button
          className="btn-primary"
          disabled={creating.rule}
          onClick={() =>
            onCreate("rule", {
              name: document.getElementById("ruleName").value,
              type: document.getElementById("ruleType").value,
              amount: Number(document.getElementById("ruleAmount").value),
              mode: document.getElementById("ruleMode").value,
              criteria: {}
            })
          }
        >
          Add rule
        </button>
      </Section>
    </div>
  );
}
