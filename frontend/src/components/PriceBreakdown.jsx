const currency = (n) => `$${n.toFixed(2)}`;

export default function PriceBreakdown({ price }) {
  if (!price) return null;
  return (
    <div className="card p-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Base (court + equipment + coach)</span>
        <span>{currency(price.baseTotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Adjustments</span>
        <span>{currency(price.adjustments)}</span>
      </div>
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>{currency(price.total)}</span>
      </div>
      {price.appliedRules?.length ? (
        <div className="text-sm text-slate-600">
          <p className="font-semibold">Applied rules</p>
          <ul className="list-disc ml-4">
            {price.appliedRules.map((r) => (
              <li key={r.id}>{r.name}: {currency(r.delta)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
