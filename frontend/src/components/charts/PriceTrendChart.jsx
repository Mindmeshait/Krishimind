// import {
//   ComposedChart, Area, XAxis, YAxis, CartesianGrid,
//   Tooltip, ReferenceLine, ResponsiveContainer,
// } from "recharts";
// import { G } from "../../styles/theme";

// function PriceTip({ active, payload, label }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background:"#fff", border:`1px solid ${G.bdr}`, borderRadius:10,
//       padding:"8px 12px", fontSize:11, fontFamily:"'Mukta',sans-serif" }}>
//       <div style={{ color:G.muted, fontSize:10, marginBottom:2 }}>{label}</div>
//       <div style={{ fontWeight:700, color:G.green, fontSize:14 }}>
//         ₹{payload[0]?.value}/kg
//       </div>
//     </div>
//   );
// }

// export default function PriceTrendChart({ data, base, pred, days, cropName, mandiName }) {
//   const rising = pred >= base;
//   const lineCol = rising ? G.green : G.red;
//   return (
//     <div>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
//         <div>
//           <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:G.text }}>
//             {cropName} · {days}-Day Forecast · {mandiName}
//           </div>
//           <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>LSTM prediction with confidence band</div>
//         </div>
//         <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
//           {[{c:G.green,l:"Predicted"},{c:G.amber,l:"Upper"},{c:"rgba(27,107,53,0.3)",l:"Lower"}].map(x => (
//             <div key={x.l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:G.muted }}>
//               <div style={{ width:16, height:2.5, background:x.c, borderRadius:2 }}/>{x.l}
//             </div>
//           ))}
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={200}>
//         <ComposedChart data={data} margin={{ top:4, right:8, left:-16, bottom:0 }}>
//           <defs>
//             <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%"  stopColor={lineCol} stopOpacity={0.15} />
//               <stop offset="95%" stopColor={lineCol} stopOpacity={0.01} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,107,53,0.06)" vertical={false} />
//           <XAxis dataKey="day" tick={{ fill:G.muted, fontSize:9 }} axisLine={false} tickLine={false}
//             interval={Math.floor(days / 6)} />
//           <YAxis tick={{ fill:G.muted, fontSize:9 }} axisLine={false} tickLine={false}
//             tickFormatter={v => `₹${v}`} />
//           <Tooltip content={<PriceTip />} />
//           <Area type="monotone" dataKey="upper" stroke={G.amber} strokeWidth={1.5}
//             strokeDasharray="5 3" fill="rgba(184,120,10,0.04)" dot={false} />
//           <Area type="monotone" dataKey="price" stroke={lineCol} strokeWidth={3}
//             fill="url(#priceFill)" dot={false}
//             activeDot={{ r:5, fill:lineCol, stroke:"#fff", strokeWidth:2 }} />
//           <Area type="monotone" dataKey="lower" stroke="rgba(27,107,53,0.25)" strokeWidth={1}
//             strokeDasharray="2 3" fill="#fff" dot={false} />
//           <ReferenceLine y={base} stroke={G.amber} strokeDasharray="4 3"
//             label={{ value:"Today", position:"right", fill:G.amber, fontSize:8 }} />
//         </ComposedChart>
//       </ResponsiveContainer>

//       <div style={{ display:"flex", gap:7, marginTop:8, flexWrap:"wrap" }}>
//         {[
//           { l:"Today", v:`₹${base}/kg`,       c:G.muted  },
//           { l:`D${days}`, v:`₹${pred}/kg`,    c:G.green  },
//           { l:"Source", v:"LSTM + Agmarknet", c:G.muted  },
//         ].map(s => (
//           <div key={s.l} style={{ background:G.light, borderRadius:7, padding:"4px 10px", fontSize:10 }}>
//             <span style={{ color:G.muted }}>{s.l}: </span>
//             <span style={{ fontWeight:700, color:s.c }}>{s.v}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import { G } from "../../styles/theme";

/* 🔥 SAFE KG CONVERSION (CRITICAL FIX) */
const toKg = (v) => {
  if (v === null || v === undefined || isNaN(v)) return 0;
  const num = Number(v);
  return num > 200 ? num / 100 : num;
};

/* ───────────────── TOOLTIP ───────────────── */
function PriceTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const price = payload.find((p) => p.dataKey === "price");
  const upper = payload.find((p) => p.dataKey === "upper");
  const lower = payload.find((p) => p.dataKey === "lower");

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${G.bdr}`,
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 11,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>

      {price && (
        <div>
          Predicted: ₹{toKg(price.value).toFixed(1)} / kg
        </div>
      )}

      {upper && (
        <div style={{ fontSize: 10 }}>
          Upper: ₹{toKg(upper.value).toFixed(1)}
        </div>
      )}

      {lower && (
        <div style={{ fontSize: 10 }}>
          Lower: ₹{toKg(lower.value).toFixed(1)}
        </div>
      )}
    </div>
  );
}

/* ───────────────── MAIN CHART ───────────────── */
export default function PriceTrendChart({
  data = [],
  base = 0,
  pred = 0,
  days = 7,
}) {
  /* 🔥 CLEAN + SAFE DATA */
  const safeData = data
    .filter((d) => d && d.price != null)
    .map((d) => ({
      day: d.day,
      price: toKg(d.price),
      upper: toKg(d.upper),
      lower: toKg(d.lower),
    }));

  const safeBase = toKg(base);
  const safePred = toKg(pred);

  const rising = safePred >= safeBase;
  const lineColor = rising ? G.green : "#E05252";

  /* 🔥 SAFE Y-AXIS CALCULATION */
  const allVals = safeData.flatMap((d) => [
    d.price || 0,
    d.upper || 0,
    d.lower || 0,
  ]);

  const minVal = Math.min(...allVals, safeBase);
  const maxVal = Math.max(...allVals, safePred);

  const pad = Math.max((maxVal - minVal) * 0.2, 1);

  const yMin = Math.max(0, minVal - pad);
  const yMax = maxVal + pad;

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v) => `₹${v.toFixed(0)}`}
          />

          <Tooltip content={<PriceTip />} />

          {/* Upper band */}
          <Area
            dataKey="upper"
            stroke="#F59E0B"
            fill="transparent"
            strokeDasharray="5 3"
          />

          {/* Lower band */}
          <Area
            dataKey="lower"
            stroke="#9CA3AF"
            fill="transparent"
            strokeDasharray="3 3"
          />

          {/* Main prediction */}
          <Area
            dataKey="price"
            stroke={lineColor}
            fillOpacity={0.2}
          />

          {/* Today reference */}
          <ReferenceLine
            y={safeBase}
            label={`Today ₹${safeBase.toFixed(1)} / kg`}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div style={{ marginTop: 12, fontSize: 14 }}>
        Today: ₹{safeBase.toFixed(1)} / kg → D{days}: ₹{safePred.toFixed(1)} / kg
      </div>
    </div>
  );
}