import { useState, useEffect, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SUPA_URL = "https://blwmvvewwhuwpyeatsny.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd212dmV3d2h1d3B5ZWF0c255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzgxODIsImV4cCI6MjA4OTcxNDE4Mn0.OVn23_cmnA9Q8W7xxRCC26hMwLQHiVFzDHRIA3AZLbI";
const hdrs = { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" };

const supa = {
  async get(t) { const r = await fetch(`${SUPA_URL}/rest/v1/${t}?select=*&order=id.asc`, { headers: hdrs }); return r.ok ? r.json() : null; },
  async insert(t, d) { const r = await fetch(`${SUPA_URL}/rest/v1/${t}`, { method: "POST", headers: hdrs, body: JSON.stringify(d) }); return r.ok ? r.json() : null; },
  async del(t, id) { await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: hdrs }); }
};

const FALLBACK_CATS = [
  { name: "Coaching", color: "#2D6A4F", type: "income" },
  { name: "Goodfin", color: "#40916C", type: "income" },
  { name: "Sophia", color: "#9D4348", type: "expense" },
  { name: "Family", color: "#B07D3B", type: "expense" },
  { name: "Food", color: "#4A6FA5", type: "expense" },
  { name: "Subscription", color: "#6B5B95", type: "expense" },
  { name: "Kalshi", color: "#C4963C", type: "expense" },
  { name: "Personal", color: "#7A6855", type: "expense" },
];

const FALLBACK_TXNS = [
  {d:"2025-11-26",i:"Sophia Water Bottle",a:66.27,t:"expense",c:"Sophia"},
  {d:"2025-11-28",i:"Sophia gift + cards",a:16.09,t:"expense",c:"Sophia"},
  {d:"2025-12-02",i:"Xmas Gift for Dylan",a:55.98,t:"expense",c:"Family"},
  {d:"2025-12-02",i:"Sophia Water Bottle",a:26.6,t:"expense",c:"Sophia"},
  {d:"2025-12-03",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-06",i:"Amazon Prime",a:8,t:"expense",c:"Subscription"},
  {d:"2025-12-07",i:"Coached Lizzy",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-07",i:"Ordered Cafe Nero",a:16.57,t:"expense",c:"Food"},
  {d:"2025-12-08",i:"Coached Eric",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-10",i:"Ordered Chipotle",a:23.76,t:"expense",c:"Food"},
  {d:"2025-12-11",i:"Coached Lizzy",a:45,t:"income",c:"Coaching"},
  {d:"2025-12-12",i:"Flowers for Sophia",a:49.12,t:"expense",c:"Sophia"},
  {d:"2025-12-14",i:"Ordered Dominos",a:32.96,t:"expense",c:"Food"},
  {d:"2025-12-15",i:"Bought Cards for Sophia",a:16.13,t:"expense",c:"Sophia"},
  {d:"2025-12-17",i:"Xmas Gifts",a:84.72,t:"expense",c:"Family"},
  {d:"2025-12-17",i:"Coached Minnie",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-17",i:"Coached Eric",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-18",i:"Coached Lizzy",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-19",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2025-12-19",i:"Ordered lunch",a:15.21,t:"expense",c:"Food"},
  {d:"2025-12-26",i:"Xmas Gifts",a:11.48,t:"expense",c:"Family"},
  {d:"2025-12-30",i:"6 Month Anniversary with Sophia",a:87.82,t:"expense",c:"Sophia"},
  {d:"2026-01-02",i:"Abu Dhabi Snacks for Sophia",a:25.24,t:"expense",c:"Sophia"},
  {d:"2026-01-06",i:"Coached Ava",a:45,t:"income",c:"Coaching",cash:true},
  {d:"2026-01-07",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2026-01-10",i:"Ordered McDonalds",a:13.72,t:"expense",c:"Food"},
  {d:"2026-01-11",i:"Ordered Dunkin",a:11.11,t:"expense",c:"Food"},
  {d:"2026-01-14",i:"Coached Minnie",a:60,t:"income",c:"Coaching"},
  {d:"2026-01-23",i:"Ordered Origin Thai Bistro",a:23.22,t:"expense",c:"Food"},
  {d:"2026-01-27",i:"Ordered Chipotle",a:29.93,t:"expense",c:"Sophia"},
  {d:"2026-01-27",i:"Ordered Boba",a:27.51,t:"expense",c:"Food"},
  {d:"2026-01-28",i:"Coached Ava",a:45,t:"income",c:"Coaching"},
  {d:"2026-01-30",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-01",i:"Chocolates for Ms. Akichika",a:38.05,t:"expense",c:"Sophia"},
  {d:"2026-02-03",i:"Ordered Tropical Smoothie",a:13.77,t:"expense",c:"Food"},
  {d:"2026-02-06",i:"Bought Gong Cha",a:9.03,t:"expense",c:"Food"},
  {d:"2026-02-06",i:"Ordered Thai Food",a:26.25,t:"expense",c:"Food"},
  {d:"2026-02-07",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-07",i:"Coached Lizzy",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-07",i:"Coached Lara",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-07",i:"Coached Minnie",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-07",i:"Coached Judy",a:60,t:"income",c:"Coaching",cash:true},
  {d:"2026-02-07",i:"Bought from CVS",a:4.88,t:"expense",c:"Sophia"},
  {d:"2026-02-07",i:"Ordered Crackd",a:22.65,t:"expense",c:"Food"},
  {d:"2026-02-08",i:"Ordered McDonalds",a:26.07,t:"expense",c:"Food"},
  {d:"2026-02-08",i:"Valentines Day Flowers + Chocolate",a:30.73,t:"expense",c:"Sophia"},
  {d:"2026-02-10",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-10",i:"Ordered Subway",a:20.63,t:"expense",c:"Food"},
  {d:"2026-02-18",i:"Coached Judy",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-19",i:"Kalshi",a:50,t:"expense",c:"Kalshi"},
  {d:"2026-02-22",i:"Ordered BBQ Chicken",a:16.15,t:"expense",c:"Food"},
  {d:"2026-02-24",i:"Kalshi",a:50,t:"expense",c:"Kalshi"},
  {d:"2026-02-24",i:"Coached Ava",a:60,t:"income",c:"Coaching"},
  {d:"2026-02-24",i:"Ordered McDonalds",a:20.46,t:"expense",c:"Food"},
  {d:"2026-02-26",i:"Kalshi",a:25,t:"expense",c:"Kalshi"},
  {d:"2026-02-26",i:"Kalshi",a:50,t:"expense",c:"Kalshi"},
  {d:"2026-02-26",i:"Coached Lizzie",a:45,t:"income",c:"Coaching"},
  {d:"2026-02-28",i:"Bought Sophia Flowers",a:21.24,t:"expense",c:"Sophia"},
  {d:"2026-03-04",i:"Coached Ava",a:45,t:"income",c:"Coaching"},
  {d:"2026-03-04",i:"Coached Lizzie",a:45,t:"income",c:"Coaching"},
  {d:"2026-03-21",i:"Coached Vedant",a:120,t:"income",c:"Coaching"},
  {d:"2026-03-21",i:"Coached Ava",a:45,t:"income",c:"Coaching"},
  {d:"2026-03-21",i:"Coached Lizzie",a:45,t:"income",c:"Coaching"},
  {d:"2026-03-21",i:"JR's Clinics",a:60,t:"income",c:"Coaching"},
  {d:"2026-03-21",i:"Food",a:21.57,t:"expense",c:"Food"},
  {d:"2026-03-21",i:"Personal purchase",a:39.99,t:"expense",c:"Personal"},
  {d:"2026-03-21",i:"Family",a:78,t:"expense",c:"Family"},
  {d:"2026-03-22",i:"Bought custom water bottle for Sophia",a:110.61,t:"expense",c:"Sophia"},
].map((x, idx) => ({ id: idx + 1, date: x.d, item: x.i, amount: x.a, type: x.t, category: x.c, cash: x.cash || false }));

const PRIOR_INCOME = 6080;
const START_BAL = 1126.33;
const font = "'EB Garamond', Garamond, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, sans-serif";
const fmt = n => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (n, t) => t === 0 ? "0%" : (n / t * 100).toFixed(1) + "%";
const extractClient = (item) => {
  const m = item.match(/Coached?\s+(.+)/i);
  if (m) { let n = m[1].replace(/\s*\(.*\)/, "").trim(); return { "Lizzy": "Lizzy/Lizzie", "Lizzie": "Lizzy/Lizzie" }[n] || n; }
  if (item.startsWith("JR")) return "JRs Clinics";
  return null;
};
const mLabel = m => { const [y, mo] = m.split("-"); return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+mo] + " '" + y.slice(2); };
const C = { bg: "#FAFAF8", card: "#FFFFFF", border: "#E8E6E1", text: "#1A1A18", muted: "#8C8C84", green: "#2D6A4F", red: "#9D4348", accent: "#1A1A18", light: "#F3F2EE" };
const CCLIENT = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#1B4332", "#344E41", "#588157"];

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 2, padding: "24px 28px", border: `1px solid ${C.border}`, ...style }}>{children}</div>; }
function Lbl({ children }) { return <label style={{ fontSize: 11, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{children}</label>; }
function Input(p) { return <input {...p} style={{ background: C.light, border: `1px solid ${C.border}`, borderRadius: 2, padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans, width: "100%", boxSizing: "border-box", outline: "none", ...(p.style || {}) }} />; }
function Sel({ children, ...p }) { return <select {...p} style={{ background: C.light, border: `1px solid ${C.border}`, borderRadius: 2, padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans, width: "100%", boxSizing: "border-box", ...(p.style || {}) }}>{children}</select>; }

export default function App() {
  const [txns, setTxns] = useState([]);
  const [cats, setCats] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [savingsView, setSavingsView] = useState("monthly");
  const [filter, setFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), item: "", amount: "", type: "expense", category: "Food", cash: false });
  const [newCat, setNewCat] = useState({ name: "", color: "#6366f1", type: "expense" });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const lk = document.createElement("link");
    lk.href = "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Inter:wght@300;400;500;600&display=swap";
    lk.rel = "stylesheet"; document.head.appendChild(lk);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, cRes] = await Promise.all([supa.get("transactions"), supa.get("categories")]);
        if (tRes && cRes) {
          setTxns(tRes.map(r => ({ id: r.id, date: r.date, item: r.item, amount: Number(r.amount), type: r.type, category: r.category, cash: r.cash || false })));
          setCats(cRes.map(r => ({ id: r.id, name: r.name, color: r.color, type: r.type })));
          setIsOnline(true);
        } else { throw new Error("null"); }
      } catch (e) {
        console.log("Supabase unavailable, using local data");
        setTxns(FALLBACK_TXNS);
        setCats(FALLBACK_CATS);
        setIsOnline(false);
      }
      setLoading(false);
    })();
  }, []);

  const catMap = useMemo(() => { const m = {}; cats.forEach(c => m[c.name] = c); return m; }, [cats]);

  const stats = useMemo(() => {
    let totInc = PRIOR_INCOME, totExp = 0, incByCat = {}, expByCat = {}, monthly = {};
    txns.forEach(tx => {
      if (tx.type === "income") { totInc += tx.amount; incByCat[tx.category] = (incByCat[tx.category] || 0) + tx.amount; }
      else { totExp += tx.amount; expByCat[tx.category] = (expByCat[tx.category] || 0) + tx.amount; }
      const m = tx.date.slice(0, 7);
      if (!monthly[m]) monthly[m] = { month: m, income: 0, expenses: 0 };
      if (tx.type === "income") monthly[m].income += tx.amount; else monthly[m].expenses += tx.amount;
    });
    const bal = START_BAL + txns.reduce((s, tx) => {
      if (tx.type === "income" && !tx.cash) return s + tx.amount;
      if (tx.type === "expense") return s - tx.amount;
      return s;
    }, 0);
    return { totInc, totExp, bal, incByCat, expByCat, monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)), net: totInc - totExp };
  }, [txns]);

  const coachingStats = useMemo(() => {
    const sessions = txns.filter(t => t.category === "Coaching" && t.type === "income");
    const byClient = {};
    sessions.forEach(s => {
      const cl = extractClient(s.item) || "Other";
      if (!byClient[cl]) byClient[cl] = { name: cl, total: 0, sessions: 0, lastDate: s.date };
      byClient[cl].total += s.amount; byClient[cl].sessions += 1;
      if (s.date > byClient[cl].lastDate) byClient[cl].lastDate = s.date;
    });
    const clients = Object.values(byClient).sort((a, b) => b.total - a.total);
    const totalRev = sessions.reduce((s, t) => s + t.amount, 0);
    const totalSessions = sessions.length;
    const byMonth = {};
    sessions.forEach(s => { const m = s.date.slice(0, 7); if (!byMonth[m]) byMonth[m] = { month: m, revenue: 0 }; byMonth[m].revenue += s.amount; });
    return { clients, totalRev, totalSessions, avgPerSession: totalSessions > 0 ? totalRev / totalSessions : 0, byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)) };
  }, [txns]);

  const savingsStats = useMemo(() => {
    const bW = {}, bM = {}, bY = {};
    txns.forEach(tx => {
      const d = new Date(tx.date + "T12:00:00");
      const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d); mon.setDate(diff);
      const wk = mon.toISOString().slice(0, 10);
      if (!bW[wk]) bW[wk] = { key: wk, income: 0, expenses: 0 };
      if (tx.type === "income") bW[wk].income += tx.amount; else bW[wk].expenses += tx.amount;
      const mo = tx.date.slice(0, 7);
      if (!bM[mo]) bM[mo] = { key: mo, income: 0, expenses: 0 };
      if (tx.type === "income") bM[mo].income += tx.amount; else bM[mo].expenses += tx.amount;
      const yr = tx.date.slice(0, 4);
      if (!bY[yr]) bY[yr] = { key: yr, income: 0, expenses: 0 };
      if (tx.type === "income") bY[yr].income += tx.amount; else bY[yr].expenses += tx.amount;
    });
    const calc = obj => Object.values(obj).sort((a, b) => b.key.localeCompare(a.key)).map(p => ({
      ...p, saved: p.income - p.expenses, rate: p.income > 0 ? ((p.income - p.expenses) / p.income * 100) : (p.expenses > 0 ? -100 : 0)
    }));
    const fM = Object.fromEntries(Object.entries(bM).filter(([k]) => k !== "2025-11"));
    const fW = Object.fromEntries(Object.entries(bW).filter(([k]) => !k.startsWith("2025-11")));
    return { weeks: calc(fW), months: calc(fM), years: calc(bY) };
  }, [txns]);

  const months = useMemo(() => { const s = new Set(); txns.forEach(tx => s.add(tx.date.slice(0, 7))); return ["All", ...[...s].sort()]; }, [txns]);
  const filteredTxns = useMemo(() => {
    let f = [...txns].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    if (filter !== "All") f = f.filter(t => t.category === filter);
    if (monthFilter !== "All") f = f.filter(t => t.date.startsWith(monthFilter));
    return f;
  }, [txns, filter, monthFilter]);

  const addTxn = async () => {
    if (!form.date || !form.item || !form.amount) return;
    const row = { date: form.date, item: form.item, amount: parseFloat(form.amount), type: form.type, category: form.category, cash: form.cash };
    if (isOnline) {
      setSyncing(true);
      try {
        const res = await supa.insert("transactions", row);
        if (res && res[0]) { const r = res[0]; setTxns(p => [...p, { id: r.id, date: r.date, item: r.item, amount: Number(r.amount), type: r.type, category: r.category, cash: r.cash || false }]); }
      } catch (e) { console.error(e); }
      setSyncing(false);
    } else {
      setTxns(p => [...p, { id: Date.now(), ...row }]);
    }
    setForm({ date: form.date, item: "", amount: "", type: form.type, category: form.category, cash: false });
    setShowAdd(false);
  };

  const delTxn = async (id) => {
    setTxns(p => p.filter(t => t.id !== id));
    if (isOnline) await supa.del("transactions", id);
  };

  const addCat = async () => {
    if (!newCat.name || cats.find(c => c.name === newCat.name)) return;
    if (isOnline) {
      setSyncing(true);
      try {
        const res = await supa.insert("categories", { name: newCat.name, color: newCat.color, type: newCat.type });
        if (res && res[0]) setCats(p => [...p, { id: res[0].id, name: res[0].name, color: res[0].color, type: res[0].type }]);
      } catch (e) { console.error(e); }
      setSyncing(false);
    } else {
      setCats(p => [...p, { id: Date.now(), ...newCat }]);
    }
    setNewCat({ name: "", color: "#6366f1", type: "expense" });
  };

  const expPie = Object.entries(stats.expByCat).map(([k, v]) => ({ name: k, value: Math.round(v * 100) / 100, color: catMap[k]?.color || "#999" }));
  const incPie = Object.entries(stats.incByCat).map(([k, v]) => ({ name: k, value: Math.round(v * 100) / 100, color: catMap[k]?.color || "#999" }));
  const savingsData = savingsView === "weekly" ? savingsStats.weeks : savingsView === "monthly" ? savingsStats.months : savingsStats.years;

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fontFamily={sans}>{(percent * 100).toFixed(0)}%</text>;
  };
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 2, padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ color: C.text, fontWeight: 600, marginBottom: 6, fontFamily: font, fontSize: 15 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontSize: 13, fontFamily: sans, marginTop: 2 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>;
  };
  const catColor = (name) => catMap[name]?.color || "#666";
  const formatSK = (k) => {
    if (savingsView === "yearly") return k;
    if (savingsView === "monthly") return mLabel(k);
    const d = new Date(k + "T12:00:00"); const e = new Date(d); e.setDate(d.getDate() + 6);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " + e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: font, fontSize: 28, fontWeight: 700, color: C.text }}>Finances</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: font, fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", lineHeight: 1 }}>Finances</h1>
            <p style={{ fontFamily: sans, fontSize: 13, color: C.muted, margin: "8px 0 0", fontWeight: 400, letterSpacing: "0.04em" }}>COREY SHEN</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: sans, fontSize: 10, color: isOnline ? C.green : C.muted, letterSpacing: "0.06em" }}>{isOnline ? "● SYNCED" : "● OFFLINE"}</span>
            {syncing && <span style={{ fontFamily: sans, fontSize: 11, color: C.muted }}>Saving...</span>}
            <button onClick={() => setShowAdd(!showAdd)} style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, padding: "10px 24px", background: C.text, color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", letterSpacing: "0.04em" }}>+ New Entry</button>
          </div>
        </div>

        {showAdd && <Card style={{ marginBottom: 32, borderLeft: `3px solid ${C.text}` }}>
          <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>New Transaction</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div><Lbl>Date</Lbl><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            <div><Lbl>Item</Lbl><Input value={form.item} onChange={e => setForm(p => ({ ...p, item: e.target.value }))} placeholder="Coached Ava, Ordered lunch..." /></div>
            <div><Lbl>Amount</Lbl><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
            <div><Lbl>Type</Lbl>
              <Sel value={form.type} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, type: v, category: cats.find(c => c.type === v)?.name || p.category })); }}>
                <option value="income">Income</option><option value="expense">Expense</option>
              </Sel>
            </div>
            <div><Lbl>Category</Lbl>
              <Sel value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {cats.filter(c => c.type === form.type).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </Sel>
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.muted, fontFamily: sans }}>
                <input type="checkbox" checked={form.cash} onChange={e => setForm(p => ({ ...p, cash: e.target.checked }))} /> Cash
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={addTxn} disabled={syncing} style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, padding: "10px 28px", background: syncing ? C.muted : C.text, color: "#fff", border: "none", borderRadius: 2, cursor: syncing ? "wait" : "pointer" }}>{syncing ? "Saving..." : "Save"}</button>
            <button onClick={() => setShowAdd(false)} style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, padding: "10px 28px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 2, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>}

        {(() => {
          const now = new Date().toISOString().slice(0, 7);
          const thisMonth = savingsStats.months.find(m => m.key === now);
          const monthRate = thisMonth ? thisMonth.rate : 0;
          const monthSaved = thisMonth ? thisMonth.saved : 0;
          return <div style={{ display: "flex", gap: 20, marginBottom: 40, alignItems: "stretch", flexWrap: "wrap" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "32px 36px", flex: "0 0 auto", minWidth: 200 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Bank Balance</div>
              <div style={{ fontSize: 38, fontWeight: 700, color: stats.bal >= 0 ? C.green : C.red, fontFamily: font, letterSpacing: "-0.02em" }}>{fmt(stats.bal)}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "32px 36px", flex: "0 0 auto", minWidth: 160 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>This Month</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: monthRate >= 0 ? C.green : C.red, fontFamily: font }}>{monthRate.toFixed(1)}%</div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: sans, marginTop: 4 }}>{monthSaved >= 0 ? "Saved" : "Overspent"} {fmt(Math.abs(monthSaved))}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "20px 28px", flex: 1, display: "flex", gap: 32, alignItems: "center", minWidth: 240 }}>
              {[
                { label: "Total Earned", value: fmt(stats.totInc), color: C.green },
                { label: "Total Spent", value: fmt(stats.totExp), color: C.red },
                { label: "Net Profit", value: fmt(stats.net), color: stats.net >= 0 ? C.green : C.red },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: s.color, fontFamily: font }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>;
        })()}

        <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 32, display: "flex", flexWrap: "wrap" }}>
          {[["dashboard", "Overview"], ["savings", "Savings"], ["coaching", "Coaching"], ["transactions", "Ledger"], ["categories", "Categories"]].map(([k, v]) =>
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "10px 0", marginRight: 28, background: "none", border: "none", cursor: "pointer",
              fontFamily: font, fontSize: 16, fontWeight: tab === k ? 600 : 400,
              color: tab === k ? C.text : C.muted,
              borderBottom: tab === k ? `2px solid ${C.text}` : "2px solid transparent",
            }}>{v}</button>
          )}
        </div>

        {tab === "dashboard" && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <Card>
              <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Expenses</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={expPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={42} labelLine={false} label={CustomPieLabel} strokeWidth={0}>
                  {expPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip formatter={v => fmt(v)} /></PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {[...expPie].sort((a, b) => b.value - a.value).map(e => (
                  <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.light}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 1, background: e.color, display: "inline-block" }} />
                      <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500 }}>{e.name}</span>
                    </div>
                    <div><span style={{ fontFamily: font, fontSize: 15, fontWeight: 600 }}>{fmt(e.value)}</span><span style={{ fontFamily: sans, fontSize: 11, color: C.muted, marginLeft: 8 }}>{pct(e.value, stats.totExp)}</span></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Income</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={incPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={42} labelLine={false} label={CustomPieLabel} strokeWidth={0}>
                  {incPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip formatter={v => fmt(v)} /></PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {[...incPie].sort((a, b) => b.value - a.value).map(e => (
                  <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.light}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 1, background: e.color, display: "inline-block" }} />
                      <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500 }}>{e.name}</span>
                    </div>
                    <span style={{ fontFamily: font, fontSize: 15, fontWeight: 600 }}>{fmt(e.value)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", opacity: 0.5 }}>
                  <span style={{ fontFamily: sans, fontSize: 13 }}>Prior (pre-Nov 2025)</span>
                  <span style={{ fontFamily: font, fontSize: 15 }}>{fmt(PRIOR_INCOME)}</span>
                </div>
              </div>
            </Card>
          </div>
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Monthly Overview</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthly.map(m => ({ ...m, label: mLabel(m.month) }))} barGap={2}>
                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12, fontFamily: sans }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 12, fontFamily: sans }} axisLine={false} tickLine={false} tickFormatter={v => "$" + v} />
                <Tooltip content={renderTooltip} /><Legend wrapperStyle={{ fontSize: 12, fontFamily: sans }} />
                <Bar dataKey="income" fill={C.green} radius={[2, 2, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill={C.red} radius={[2, 2, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>By Category</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 16, marginBottom: 32 }}>
            {[...expPie].sort((a, b) => b.value - a.value).map(e => (
              <Card key={e.name} style={{ padding: "20px 24px", borderLeft: `3px solid ${e.color}` }}>
                <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 500, color: e.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{e.name}</div>
                <div style={{ fontFamily: font, fontSize: 24, fontWeight: 700, marginTop: 6 }}>{fmt(e.value)}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, marginTop: 2 }}>{pct(e.value, stats.totExp)}</div>
              </Card>
            ))}
          </div>
        </>}

        {tab === "savings" && <>
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: C.light, borderRadius: 2, overflow: "hidden", border: `1px solid ${C.border}`, width: "fit-content" }}>
            {[["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]].map(([k, v]) => (
              <button key={k} onClick={() => setSavingsView(k)} style={{
                fontFamily: sans, fontSize: 13, fontWeight: savingsView === k ? 600 : 400, padding: "10px 24px",
                background: savingsView === k ? C.card : "transparent", color: savingsView === k ? C.text : C.muted,
                border: "none", cursor: "pointer", borderRight: `1px solid ${C.border}`,
              }}>{v}</button>
            ))}
          </div>
          {(() => {
            const pl = savingsView === "weekly" ? "Week" : savingsView === "monthly" ? "Month" : "Year";
            const avgR = savingsData.length > 0 ? savingsData.reduce((s, d) => s + d.rate, 0) / savingsData.length : 0;
            const avgS = savingsData.length > 0 ? savingsData.reduce((s, d) => s + d.saved, 0) / savingsData.length : 0;
            const best = savingsData.length > 0 ? [...savingsData].sort((a, b) => b.saved - a.saved)[0] : null;
            const pos = savingsData.filter(d => d.saved > 0).length;
            return <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.border, border: `1px solid ${C.border}`, marginBottom: 32 }}>
              {[
                { label: `Avg ${pl}ly Rate`, value: avgR.toFixed(1) + "%", color: avgR >= 0 ? C.green : C.red },
                { label: `Avg Saved / ${pl}`, value: fmt(avgS), color: avgS >= 0 ? C.green : C.red },
                { label: `Best ${pl}`, value: best ? fmt(best.saved) : "—", sub: best ? formatSK(best.key) : "", color: C.green },
                { label: `Positive ${pl}s`, value: `${pos} / ${savingsData.length}`, color: C.text },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, padding: "24px 20px" }}>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: s.color, fontFamily: font }}>{s.value}</div>
                  {s.sub && <div style={{ fontSize: 11, color: C.muted, fontFamily: sans, marginTop: 4 }}>{s.sub}</div>}
                </div>
              ))}
            </div>;
          })()}
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Savings Rate Over Time</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[...savingsData].reverse().map(d => ({ ...d, label: formatSK(d.key) }))}>
                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11, fontFamily: sans }} axisLine={{ stroke: C.border }} tickLine={false} interval={savingsView === "weekly" ? 2 : 0} />
                <YAxis tick={{ fill: C.muted, fontSize: 12, fontFamily: sans }} axisLine={false} tickLine={false} tickFormatter={v => v + "%"} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const d = payload[0].payload;
                  return <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 2, padding: "14px 18px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontFamily: font, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{label}</div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: C.green }}>Income: {fmt(d.income)}</div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: C.red }}>Spent: {fmt(d.expenses)}</div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: d.saved >= 0 ? C.green : C.red, fontWeight: 600, marginTop: 4, paddingTop: 6, borderTop: `1px solid ${C.light}` }}>Saved: {fmt(d.saved)} ({d.rate.toFixed(1)}%)</div>
                  </div>;
                }} />
                <Bar dataKey="rate" radius={[2, 2, 0, 0]}>
                  {[...savingsData].reverse().map((d, i) => <Cell key={i} fill={d.rate >= 0 ? C.green : C.red} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
                  {["Period", "Income", "Expenses", "Saved", "Rate"].map(h => <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: C.muted, fontWeight: 500, fontSize: 11, fontFamily: sans, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>)}
                </tr></thead>
                <tbody>{savingsData.map(d => (
                  <tr key={d.key} style={{ borderBottom: `1px solid ${C.light}` }}>
                    <td style={{ padding: "14px 20px", fontFamily: font, fontSize: 15, fontWeight: 500 }}>{formatSK(d.key)}</td>
                    <td style={{ padding: "14px 20px", fontFamily: font, fontSize: 15, color: C.green }}>{fmt(d.income)}</td>
                    <td style={{ padding: "14px 20px", fontFamily: font, fontSize: 15, color: C.red }}>{fmt(d.expenses)}</td>
                    <td style={{ padding: "14px 20px", fontFamily: font, fontSize: 15, fontWeight: 600, color: d.saved >= 0 ? C.green : C.red }}>{fmt(d.saved)}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 60, height: 6, borderRadius: 1, background: C.light, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 1, background: d.rate >= 0 ? C.green : C.red, width: `${Math.min(100, Math.abs(d.rate))}%` }} />
                        </div>
                        <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: d.rate >= 0 ? C.green : C.red }}>{d.rate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        </>}

        {tab === "coaching" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.border, border: `1px solid ${C.border}`, marginBottom: 32 }}>
            {[
              { label: "Coaching Revenue", value: fmt(coachingStats.totalRev) },
              { label: "Total Sessions", value: String(coachingStats.totalSessions) },
              { label: "Avg Per Session", value: fmt(coachingStats.avgPerSession) },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, padding: "24px 20px" }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: sans, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: C.green, fontFamily: font }}>{s.value}</div>
              </div>
            ))}
          </div>
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Monthly Revenue</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={coachingStats.byMonth.map(m => ({ ...m, label: mLabel(m.month) }))}>
                <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12, fontFamily: sans }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 12, fontFamily: sans }} axisLine={false} tickLine={false} tickFormatter={v => "$" + v} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload || !payload[0]) return null;
                  return <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 2, padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontFamily: font, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: sans, color: C.green, fontSize: 13 }}>Revenue: {fmt(payload[0].value)}</div>
                  </div>;
                }} />
                <Bar dataKey="revenue" fill={C.green} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Clients</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
            {coachingStats.clients.map((cl, i) => (
              <Card key={cl.name} style={{ padding: "20px 24px", borderLeft: `3px solid ${CCLIENT[i % CCLIENT.length]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: font, fontSize: 18, fontWeight: 700 }}>{cl.name}</span>
                  <span style={{ fontFamily: sans, fontSize: 11, color: C.muted }}>{cl.sessions} sessions</span>
                </div>
                <div style={{ fontFamily: font, fontSize: 24, fontWeight: 700, color: CCLIENT[i % CCLIENT.length], marginTop: 8 }}>{fmt(cl.total)}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, marginTop: 6 }}>
                  {fmt(cl.total / cl.sessions)} avg · Last {new Date(cl.lastDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Recent Sessions</p>
            {txns.filter(t => t.category === "Coaching" && t.type === "income").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12).map(tx => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.light}` }}>
                <div>
                  <div style={{ fontFamily: font, fontWeight: 600, fontSize: 16 }}>{tx.item}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, marginTop: 2 }}>{new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{tx.cash ? " · Cash" : ""}</div>
                </div>
                <div style={{ fontFamily: font, fontWeight: 700, color: C.green, fontSize: 18 }}>+{fmt(tx.amount)}</div>
              </div>
            ))}
          </Card>
        </>}

        {tab === "transactions" && <>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Sel value={filter} onChange={e => setFilter(e.target.value)} style={{ width: "auto", minWidth: 150 }}>
              <option value="All">All Categories</option>
              {cats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </Sel>
            <Sel value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width: "auto", minWidth: 150 }}>
              {months.map(m => <option key={m} value={m}>{m === "All" ? "All Months" : mLabel(m)}</option>)}
            </Sel>
            <span style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{filteredTxns.length} entries</span>
          </div>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 560, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
                  {["Date", "Description", "Category", "Amount", ""].map(h => <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: C.muted, fontWeight: 500, fontSize: 11, fontFamily: sans, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>)}
                </tr></thead>
                <tbody>{filteredTxns.map(tx => <tr key={tx.id} style={{ borderBottom: `1px solid ${C.light}` }}>
                  <td style={{ padding: "14px 20px", fontFamily: sans, fontSize: 13, color: C.muted }}>{new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}</td>
                  <td style={{ padding: "14px 20px", fontFamily: font, fontSize: 15, fontWeight: 500 }}>
                    {tx.item}{tx.cash && <span style={{ fontFamily: sans, fontSize: 10, color: C.muted, marginLeft: 8, border: `1px solid ${C.border}`, padding: "1px 6px", borderRadius: 2 }}>CASH</span>}
                  </td>
                                      <td style={{ padding: "14px 20px" }}><span style={{ color: catColor(tx.category), fontSize: 13, fontFamily: sans, fontWeight: 500 }}>{tx.category}</span></td>
                  <td style={{ padding: "14px 20px", fontFamily: font, fontWeight: 600, fontSize: 16, color: tx.type === "income" ? C.green : C.red, fontVariantNumeric: "tabular-nums" }}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button onClick={() => delTxn(tx.id)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.red, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 2, fontFamily: sans, fontWeight: 500 }}>Delete</button>
                  </td>
                </tr>)}</tbody>
              </table>
            </div>
          </Card>
        </>}

        {tab === "categories" && <>
          <Card style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: font, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>New Category</p>
            <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}><Lbl>Name</Lbl><Input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="Category name" /></div>
              <div style={{ minWidth: 60 }}><Lbl>Color</Lbl><input type="color" value={newCat.color} onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))} style={{ width: 42, height: 42, border: `1px solid ${C.border}`, borderRadius: 2, cursor: "pointer", background: "transparent", padding: 2 }} /></div>
              <div style={{ minWidth: 120 }}><Lbl>Type</Lbl>
                <Sel value={newCat.type} onChange={e => setNewCat(p => ({ ...p, type: e.target.value }))}>
                  <option value="expense">Expense</option><option value="income">Income</option>
                </Sel>
              </div>
              <button onClick={addCat} disabled={syncing} style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, padding: "10px 24px", height: 42, background: C.text, color: "#fff", border: "none", borderRadius: 2, cursor: "pointer" }}>Add</button>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {cats.map(c => {
              const amt = c.type === "income" ? (stats.incByCat[c.name] || 0) : (stats.expByCat[c.name] || 0);
              const tot = c.type === "income" ? stats.totInc : stats.totExp;
              return <Card key={c.name} style={{ padding: "20px 24px", borderLeft: `3px solid ${c.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: c.color }}>{c.name}</span>
                  <span style={{ fontFamily: sans, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: c.type === "income" ? C.green : C.red }}>{c.type}</span>
                </div>
                <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, marginTop: 8 }}>{fmt(amt)}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, marginTop: 2 }}>{pct(amt, tot)}</div>
                <div style={{ marginTop: 10, height: 3, borderRadius: 1, background: C.light }}>
                  <div style={{ height: "100%", borderRadius: 1, background: c.color, width: tot > 0 ? `${Math.min(100, amt / tot * 100)}%` : "0%" }} />
                </div>
              </Card>;
            })}
          </div>
        </>}

        <p style={{ textAlign: "center", padding: "48px 0 0", fontFamily: sans, fontSize: 11, color: C.border, letterSpacing: "0.08em" }}>
          {isOnline ? "SYNCED WITH SUPABASE" : "OFFLINE MODE"} · $6,080 PRIOR INCOME INCLUDED
        </p>
      </div>
    </div>
  );
}
