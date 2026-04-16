import { useState, useEffect, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SUPA_URL = "https://blwmvvewwhuwpyeatsny.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd212dmV3d2h1d3B5ZWF0c255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzgxODIsImV4cCI6MjA4OTcxNDE4Mn0.OVn23_cmnA9Q8W7xxRCC26hMwLQHiVFzDHRIA3AZLbI";
const hdrs = { "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY, "Content-Type": "application/json", "Prefer": "return=representation" };
const supa = {
  async get(t) { try { const r = await fetch(SUPA_URL + "/rest/v1/" + t + "?select=*&order=id.asc", { headers: hdrs }); return r.ok ? r.json() : null; } catch(e) { return null; } },
  async insert(t, d) { try { const r = await fetch(SUPA_URL + "/rest/v1/" + t, { method: "POST", headers: hdrs, body: JSON.stringify(d) }); return r.ok ? r.json() : null; } catch(e) { return null; } },
  async del(t, id) { try { await fetch(SUPA_URL + "/rest/v1/" + t + "?id=eq." + id, { method: "DELETE", headers: hdrs }); } catch(e) {} }
};

const FALLBACK_CATS = [
  { name: "Coaching", color: "#2D6A4F", type: "income" },
  { name: "Goodfin", color: "#40916C", type: "income" },
  { name: "Sophia", color: "#F4B8D0", type: "expense" },
  { name: "Family", color: "#B07D3B", type: "expense" },
  { name: "Food", color: "#4A6FA5", type: "expense" },
  { name: "Subscription", color: "#6B5B95", type: "expense" },
  { name: "Kalshi", color: "#C4963C", type: "expense" },
  { name: "Personal", color: "#7A6855", type: "expense" },
  { name: "Robinhood", color: "#00C805", type: "investment" },
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
].map(function(x, idx) { return { id: idx + 1, date: x.d, item: x.i, amount: x.a, type: x.t, category: x.c, cash: x.cash || false }; });

var PRIOR_INCOME = 6080;
var START_BAL = 1126.33;
var ft = "'EB Garamond', Garamond, 'Times New Roman', serif";
var sn = "'Inter', -apple-system, sans-serif";
var dollar = function(n) { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); };
var pct = function(n, t) { return t === 0 ? "0%" : (n / t * 100).toFixed(1) + "%"; };
var extractClient = function(item) {
  var m = item.match(/Coached?\s+(.+)/i);
  if (m) { var n = m[1].replace(/\s*\(.*\)/, "").trim(); if (n === "Lizzy" || n === "Lizzie") return "Lizzy/Lizzie"; return n; }
  if (item.indexOf("JR") === 0) return "JRs Clinics";
  return null;
};
var mLabel = function(m) { var p = m.split("-"); return ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+p[1]] + " '" + p[0].slice(2); };
var CL = { bg:"#FAFAF8", card:"#FFFFFF", border:"#E8E6E1", text:"#1A1A18", muted:"#8C8C84", green:"#2D6A4F", red:"#9D4348", light:"#F3F2EE" };
var CCLIENT = ["#2D6A4F","#40916C","#52B788","#74C69D","#95D5B2","#1B4332","#344E41","#588157"];

function Card(props) { return <div style={Object.assign({ background: CL.card, borderRadius: 2, padding: "24px 28px", border: "1px solid " + CL.border }, props.style || {})}>{props.children}</div>; }
function Lbl(props) { return <label style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{props.children}</label>; }
function Inp(props) { return <input {...props} style={Object.assign({ background: CL.light, border: "1px solid " + CL.border, borderRadius: 2, padding: "10px 14px", color: CL.text, fontSize: 14, fontFamily: sn, width: "100%", boxSizing: "border-box", outline: "none" }, props.style || {})} />; }
function Sel(props) { return <select {...props} style={Object.assign({ background: CL.light, border: "1px solid " + CL.border, borderRadius: 2, padding: "10px 14px", color: CL.text, fontSize: 14, fontFamily: sn, width: "100%", boxSizing: "border-box" }, props.style || {})}>{props.children}</select>; }

function computeBalances(txns) {
  var sorted = txns.slice().sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id; });
  var result = {};
  var bal = START_BAL;
  for (var i = 0; i < sorted.length; i++) {
    var tx = sorted[i];
    if (tx.type === "income" && !tx.cash) { bal = bal + tx.amount; }
    else if (tx.type === "expense") { bal = bal - tx.amount; }
    else if (tx.type === "investment") { bal = bal - tx.amount; }
    result[tx.id] = Math.round(bal * 100) / 100;
  }
  return result;
}

export default function App() {
  var _s = useState([]), txns = _s[0], setTxns = _s[1];
  var _c = useState([]), cats = _c[0], setCats = _c[1];
  var _t = useState("dashboard"), tab = _t[0], setTab = _t[1];
  var _sv = useState("monthly"), savingsView = _sv[0], setSavingsView = _sv[1];
  var _f = useState("All"), filter = _f[0], setFilter = _f[1];
  var _mf = useState("All"), monthFilter = _mf[0], setMonthFilter = _mf[1];
  var _fm = useState({ date: new Date().toISOString().slice(0,10), item: "", amount: "", type: "expense", category: "Food", cash: false }), form = _fm[0], setForm = _fm[1];
  var _nc = useState({ name: "", color: "#6366f1", type: "expense" }), newCat = _nc[0], setNewCat = _nc[1];
  var _l = useState(true), loading = _l[0], setLoading = _l[1];
  var _sa = useState(false), showAdd = _sa[0], setShowAdd = _sa[1];
  var _sy = useState(false), syncing = _sy[0], setSyncing = _sy[1];
  var _on = useState(false), isOnline = _on[0], setIsOnline = _on[1];

  useEffect(function() {
    var lk = document.createElement("link");
    lk.href = "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Inter:wght@300;400;500;600&display=swap";
    lk.rel = "stylesheet"; document.head.appendChild(lk);
  }, []);

  useEffect(function() {
    (async function() {
      var tRes = await supa.get("transactions");
      var cRes = await supa.get("categories");
      if (tRes && cRes) {
        setTxns(tRes.map(function(r) { return { id: r.id, date: r.date, item: r.item, amount: Number(r.amount), type: r.type, category: r.category, cash: r.cash || false }; }));
        setCats(cRes.map(function(r) { return { id: r.id, name: r.name, color: r.color, type: r.type }; }));
        setIsOnline(true);
      } else {
        setTxns(FALLBACK_TXNS);
        setCats(FALLBACK_CATS);
      }
      setLoading(false);
    })();
  }, []);

  var catMap = useMemo(function() { var m = {}; cats.forEach(function(c) { m[c.name] = c; }); return m; }, [cats]);
  var catColor = function(name) { return catMap[name] ? catMap[name].color : "#666"; };

  var balanceMap = useMemo(function() { return computeBalances(txns); }, [txns]);

  var stats = useMemo(function() {
    var totInc = PRIOR_INCOME, totExp = 0, totInv = 0, incByCat = {}, expByCat = {}, monthly = {}, monthlyInv = {};
    txns.forEach(function(tx) {
      if (tx.type === "income") { totInc += tx.amount; incByCat[tx.category] = (incByCat[tx.category] || 0) + tx.amount; }
      else if (tx.type === "expense") { totExp += tx.amount; expByCat[tx.category] = (expByCat[tx.category] || 0) + tx.amount; }
      else if (tx.type === "investment") { totInv += tx.amount; }
      var m = tx.date.slice(0,7);
      if (!monthly[m]) monthly[m] = { month: m, income: 0, expenses: 0 };
      if (tx.type === "income") monthly[m].income += tx.amount; else if (tx.type === "expense") monthly[m].expenses += tx.amount;
      if (!monthlyInv[m]) monthlyInv[m] = 0;
      if (tx.type === "investment") monthlyInv[m] += tx.amount;
    });
    var bal = START_BAL + txns.reduce(function(s, tx) {
      if (tx.type === "income" && !tx.cash) return s + tx.amount;
      if (tx.type === "expense") return s - tx.amount;
      if (tx.type === "investment") return s - tx.amount;
      return s;
    }, 0);
    return { totInc: totInc, totExp: totExp, totInv: totInv, monthlyInv: monthlyInv, bal: bal, incByCat: incByCat, expByCat: expByCat, monthly: Object.values(monthly).sort(function(a,b) { return a.month.localeCompare(b.month); }), net: totInc - totExp };
  }, [txns]);

  var coachingStats = useMemo(function() {
    var sessions = txns.filter(function(t) { return t.category === "Coaching" && t.type === "income"; });
    var byClient = {};
    sessions.forEach(function(s) {
      var cl = extractClient(s.item) || "Other";
      if (!byClient[cl]) byClient[cl] = { name: cl, total: 0, sessions: 0, lastDate: s.date };
      byClient[cl].total += s.amount; byClient[cl].sessions += 1;
      if (s.date > byClient[cl].lastDate) byClient[cl].lastDate = s.date;
    });
    var clients = Object.values(byClient).sort(function(a,b) { return b.total - a.total; });
    var totalRev = sessions.reduce(function(s,t) { return s + t.amount; }, 0);
    var totalSessions = sessions.length;
    var byMonth = {};
    sessions.forEach(function(s) { var m = s.date.slice(0,7); if (!byMonth[m]) byMonth[m] = { month: m, revenue: 0 }; byMonth[m].revenue += s.amount; });
    return { clients: clients, totalRev: totalRev, totalSessions: totalSessions, avgPerSession: totalSessions > 0 ? totalRev / totalSessions : 0, byMonth: Object.values(byMonth).sort(function(a,b) { return a.month.localeCompare(b.month); }) };
  }, [txns]);

  var savingsStats = useMemo(function() {
    var bW = {}, bM = {}, bY = {};
    txns.forEach(function(tx) {
      var d = new Date(tx.date + "T12:00:00");
      var day = d.getDay(); var diff = d.getDate() - day + (day === 0 ? -6 : 1);
      var mon = new Date(d); mon.setDate(diff);
      var wk = mon.toISOString().slice(0,10);
      if (!bW[wk]) bW[wk] = { key: wk, income: 0, expenses: 0 };
      if (tx.type === "income") bW[wk].income += tx.amount; else if (tx.type === "expense") bW[wk].expenses += tx.amount;
      var mo = tx.date.slice(0,7);
      if (!bM[mo]) bM[mo] = { key: mo, income: 0, expenses: 0 };
      if (tx.type === "income") bM[mo].income += tx.amount; else if (tx.type === "expense") bM[mo].expenses += tx.amount;
      var yr = tx.date.slice(0,4);
      if (!bY[yr]) bY[yr] = { key: yr, income: 0, expenses: 0 };
      if (tx.type === "income") bY[yr].income += tx.amount; else if (tx.type === "expense") bY[yr].expenses += tx.amount;
    });
    var calc = function(obj) { return Object.values(obj).sort(function(a,b) { return b.key.localeCompare(a.key); }).map(function(p) {
      return Object.assign({}, p, { saved: p.income - p.expenses, rate: p.income > 0 ? ((p.income - p.expenses) / p.income * 100) : (p.expenses > 0 ? -100 : 0) });
    }); };
    var fM = {}; Object.keys(bM).forEach(function(k) { if (k !== "2025-11") fM[k] = bM[k]; });
    var fW = {}; Object.keys(bW).forEach(function(k) { if (k.indexOf("2025-11") !== 0) fW[k] = bW[k]; });
    return { weeks: calc(fW), months: calc(fM), years: calc(bY) };
  }, [txns]);

  var months = useMemo(function() { var s = {}; txns.forEach(function(tx) { s[tx.date.slice(0,7)] = true; }); return ["All"].concat(Object.keys(s).sort()); }, [txns]);

  var filteredTxns = useMemo(function() {
    var f = txns.slice().sort(function(a,b) { return b.date.localeCompare(a.date) || b.id - a.id; });
    if (filter !== "All") f = f.filter(function(t) { return t.category === filter; });
    if (monthFilter !== "All") f = f.filter(function(t) { return t.date.indexOf(monthFilter) === 0; });
    return f;
  }, [txns, filter, monthFilter]);

  var addTxn = async function() {
    if (!form.date || !form.item || !form.amount) return;
    var row = { date: form.date, item: form.item, amount: parseFloat(form.amount), type: form.type, category: form.category, cash: form.cash };
    if (isOnline) {
      setSyncing(true);
      var res = await supa.insert("transactions", row);
      if (res && res[0]) { var r = res[0]; setTxns(function(p) { return p.concat([{ id: r.id, date: r.date, item: r.item, amount: Number(r.amount), type: r.type, category: r.category, cash: r.cash || false }]); }); }
      setSyncing(false);
    } else {
      setTxns(function(p) { return p.concat([Object.assign({ id: Date.now() }, row)]); });
    }
    setForm({ date: form.date, item: "", amount: "", type: form.type, category: form.category, cash: false });
    setShowAdd(false);
  };

  var delTxn = async function(id) {
    setTxns(function(p) { return p.filter(function(t) { return t.id !== id; }); });
    if (isOnline) await supa.del("transactions", id);
  };

  var addCat = async function() {
    if (!newCat.name || cats.find(function(c) { return c.name === newCat.name; })) return;
    if (isOnline) {
      setSyncing(true);
      var res = await supa.insert("categories", { name: newCat.name, color: newCat.color, type: newCat.type });
      if (res && res[0]) setCats(function(p) { return p.concat([{ id: res[0].id, name: res[0].name, color: res[0].color, type: res[0].type }]); });
      setSyncing(false);
    } else {
      setCats(function(p) { return p.concat([Object.assign({ id: Date.now() }, newCat)]); });
    }
    setNewCat({ name: "", color: "#6366f1", type: "expense" });
  };

  var expPie = Object.entries(stats.expByCat).map(function(e) { return { name: e[0], value: Math.round(e[1] * 100) / 100, color: catColor(e[0]) }; });
  var incPie = Object.entries(stats.incByCat).map(function(e) { return { name: e[0], value: Math.round(e[1] * 100) / 100, color: catColor(e[0]) }; });
  var savingsData = savingsView === "weekly" ? savingsStats.weeks : savingsView === "monthly" ? savingsStats.months : savingsStats.years;

  var formatSK = function(k) {
    if (savingsView === "yearly") return k;
    if (savingsView === "monthly") return mLabel(k);
    var d = new Date(k + "T12:00:00"); var e = new Date(d); e.setDate(d.getDate() + 6);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " - " + e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  };

  var PieLabel = function(props) {
    if (props.percent < 0.05) return null;
    var r = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
    var x = props.cx + r * Math.cos(-props.midAngle * Math.PI / 180);
    var y = props.cy + r * Math.sin(-props.midAngle * Math.PI / 180);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fontFamily={sn}>{(props.percent * 100).toFixed(0)}%</text>;
  };

  var TT = function(props) {
    if (!props.active || !props.payload) return null;
    return <div style={{ background: "#fff", border: "1px solid " + CL.border, borderRadius: 2, padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ color: CL.text, fontWeight: 600, marginBottom: 6, fontFamily: ft, fontSize: 15 }}>{props.label}</div>
      {props.payload.map(function(p, i) { return <div key={i} style={{ color: p.color, fontSize: 13, fontFamily: sn, marginTop: 2 }}>{p.name}: {dollar(p.value)}</div>; })}
    </div>;
  };

  if (loading) return (
    <div style={{ background: CL.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: ft, fontSize: 28, fontWeight: 700, color: CL.text }}>Finances</div>
      <div style={{ fontFamily: sn, fontSize: 13, color: CL.muted }}>Loading...</div>
    </div>
  );

  var nowMonth = new Date().toISOString().slice(0,7);
  var thisMonthData = savingsStats.months.find(function(m) { return m.key === nowMonth; });
  var monthRate = thisMonthData ? thisMonthData.rate : 0;
  var monthSaved = thisMonthData ? thisMonthData.saved : 0;
  var monthInvested = stats.monthlyInv[nowMonth] || 0;

  return (
    <div style={{ background: CL.bg, minHeight: "100vh", color: CL.text }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: ft, fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", lineHeight: 1 }}>Finances</h1>
            <p style={{ fontFamily: sn, fontSize: 13, color: CL.muted, margin: "8px 0 0", fontWeight: 400, letterSpacing: "0.04em" }}>COREY SHEN</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: sn, fontSize: 10, color: isOnline ? CL.green : CL.muted, letterSpacing: "0.06em" }}>{isOnline ? "SYNCED" : "OFFLINE"}</span>
            {syncing && <span style={{ fontFamily: sn, fontSize: 11, color: CL.muted }}>Saving...</span>}
            <button onClick={function() { setShowAdd(!showAdd); }} style={{ fontFamily: sn, fontSize: 13, fontWeight: 500, padding: "10px 24px", background: CL.text, color: "#fff", border: "none", borderRadius: 2, cursor: "pointer" }}>+ New Entry</button>
          </div>
        </div>

        {showAdd && <Card style={{ marginBottom: 32, borderLeft: "3px solid " + CL.text }}>
          <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>New Transaction</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={function(e) { setForm(Object.assign({}, form, { date: e.target.value })); }} /></div>
            <div><Lbl>Item</Lbl><Inp value={form.item} onChange={function(e) { setForm(Object.assign({}, form, { item: e.target.value })); }} placeholder="Coached Ava, Ordered lunch..." /></div>
            <div><Lbl>Amount</Lbl><Inp type="number" step="0.01" value={form.amount} onChange={function(e) { setForm(Object.assign({}, form, { amount: e.target.value })); }} placeholder="0.00" /></div>
            <div><Lbl>Type</Lbl>
              <Sel value={form.type} onChange={function(e) { var v = e.target.value; var firstCat = cats.find(function(c) { return c.type === v; }); setForm(Object.assign({}, form, { type: v, category: firstCat ? firstCat.name : form.category })); }}>
                <option value="income">Income</option><option value="expense">Expense</option><option value="investment">Investment</option>
              </Sel>
            </div>
            <div><Lbl>Category</Lbl>
              <Sel value={form.category} onChange={function(e) { setForm(Object.assign({}, form, { category: e.target.value })); }}>
                {cats.filter(function(c) { return c.type === form.type; }).map(function(c) { return <option key={c.name} value={c.name}>{c.name}</option>; })}
              </Sel>
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: CL.muted, fontFamily: sn }}>
                <input type="checkbox" checked={form.cash} onChange={function(e) { setForm(Object.assign({}, form, { cash: e.target.checked })); }} /> Cash
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={addTxn} disabled={syncing} style={{ fontFamily: sn, fontSize: 13, fontWeight: 500, padding: "10px 28px", background: syncing ? CL.muted : CL.text, color: "#fff", border: "none", borderRadius: 2, cursor: syncing ? "wait" : "pointer" }}>{syncing ? "Saving..." : "Save"}</button>
            <button onClick={function() { setShowAdd(false); }} style={{ fontFamily: sn, fontSize: 13, fontWeight: 500, padding: "10px 28px", background: "transparent", color: CL.muted, border: "1px solid " + CL.border, borderRadius: 2, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>}

        <div style={{ display: "flex", gap: 20, marginBottom: 40, alignItems: "stretch", flexWrap: "wrap" }}>
          <div style={{ background: CL.card, border: "1px solid " + CL.border, padding: "32px 36px", flex: "0 0 auto", minWidth: 200 }}>
            <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Bank Balance</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: stats.bal >= 0 ? CL.green : CL.red, fontFamily: ft, letterSpacing: "-0.02em" }}>{dollar(stats.bal)}</div>
          </div>
          <div style={{ background: CL.card, border: "1px solid " + CL.border, padding: "32px 36px", flex: "0 0 auto", minWidth: 160 }}>
            <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>This Month</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: monthRate >= 0 ? CL.green : CL.red, fontFamily: ft }}>{monthRate.toFixed(1)}%</div>
            <div style={{ fontSize: 12, color: CL.muted, fontFamily: sn, marginTop: 4 }}>{monthSaved >= 0 ? "Saved" : "Overspent"} {dollar(Math.abs(monthSaved))}</div>
          </div>
          <div style={{ background: CL.card, border: "1px solid " + CL.border, padding: "32px 36px", flex: "0 0 auto", minWidth: 150 }}>
            <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Invested</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#00C805", fontFamily: ft }}>{dollar(stats.totInv)}</div>
            <div style={{ fontSize: 12, color: CL.muted, fontFamily: sn, marginTop: 4 }}>{monthInvested > 0 ? dollar(monthInvested) + " this month" : "None this month"}</div>
          </div>
          <div style={{ background: CL.card, border: "1px solid " + CL.border, padding: "20px 28px", flex: 1, display: "flex", gap: 32, alignItems: "center", minWidth: 240 }}>
            {[
              { label: "Total Earned", value: dollar(stats.totInc), color: CL.green },
              { label: "Total Spent", value: dollar(stats.totExp), color: CL.red },
              { label: "Net Profit", value: dollar(stats.net), color: stats.net >= 0 ? CL.green : CL.red },
            ].map(function(s, i) { return <div key={i}>
              <div style={{ fontSize: 10, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: s.color, fontFamily: ft }}>{s.value}</div>
            </div>; })}
          </div>
        </div>

        <div style={{ borderBottom: "1px solid " + CL.border, marginBottom: 32, display: "flex", flexWrap: "wrap" }}>
          {[["dashboard","Overview"],["savings","Savings"],["coaching","Coaching"],["transactions","Ledger"],["categories","Categories"]].map(function(pair) {
            var k = pair[0], v = pair[1];
            return <button key={k} onClick={function() { setTab(k); }} style={{ padding: "10px 0", marginRight: 28, background: "none", border: "none", cursor: "pointer", fontFamily: ft, fontSize: 16, fontWeight: tab === k ? 600 : 400, color: tab === k ? CL.text : CL.muted, borderBottom: tab === k ? "2px solid " + CL.text : "2px solid transparent" }}>{v}</button>;
          })}
        </div>

        {/* DASHBOARD */}
        {tab === "dashboard" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <Card>
              <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Expenses</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={expPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={42} labelLine={false} label={PieLabel} strokeWidth={0}>
                  {expPie.map(function(e, i) { return <Cell key={i} fill={e.color} />; })}
                </Pie><Tooltip formatter={function(v) { return dollar(v); }} /></PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {expPie.slice().sort(function(a,b) { return b.value - a.value; }).map(function(e) { return <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid " + CL.light }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 10, height: 10, borderRadius: 1, background: e.color, display: "inline-block" }} /><span style={{ fontFamily: sn, fontSize: 13, fontWeight: 500 }}>{e.name}</span></div>
                  <div><span style={{ fontFamily: ft, fontSize: 15, fontWeight: 600 }}>{dollar(e.value)}</span><span style={{ fontFamily: sn, fontSize: 11, color: CL.muted, marginLeft: 8 }}>{pct(e.value, stats.totExp)}</span></div>
                </div>; })}
              </div>
            </Card>
            <Card>
              <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Income</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={incPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={42} labelLine={false} label={PieLabel} strokeWidth={0}>
                  {incPie.map(function(e, i) { return <Cell key={i} fill={e.color} />; })}
                </Pie><Tooltip formatter={function(v) { return dollar(v); }} /></PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {incPie.slice().sort(function(a,b) { return b.value - a.value; }).map(function(e) { return <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid " + CL.light }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 10, height: 10, borderRadius: 1, background: e.color, display: "inline-block" }} /><span style={{ fontFamily: sn, fontSize: 13, fontWeight: 500 }}>{e.name}</span></div>
                  <span style={{ fontFamily: ft, fontSize: 15, fontWeight: 600 }}>{dollar(e.value)}</span>
                </div>; })}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", opacity: 0.5 }}>
                  <span style={{ fontFamily: sn, fontSize: 13 }}>Prior (pre-Nov 2025)</span>
                  <span style={{ fontFamily: ft, fontSize: 15 }}>{dollar(PRIOR_INCOME)}</span>
                </div>
              </div>
            </Card>
          </div>
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Monthly Overview</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthly.map(function(m) { return Object.assign({}, m, { label: mLabel(m.month) }); })} barGap={2}>
                <XAxis dataKey="label" tick={{ fill: CL.muted, fontSize: 12, fontFamily: sn }} axisLine={{ stroke: CL.border }} tickLine={false} />
                <YAxis tick={{ fill: CL.muted, fontSize: 12, fontFamily: sn }} axisLine={false} tickLine={false} tickFormatter={function(v) { return "$" + v; }} />
                <Tooltip content={TT} /><Legend wrapperStyle={{ fontSize: 12, fontFamily: sn }} />
                <Bar dataKey="income" fill={CL.green} radius={[2,2,0,0]} name="Income" />
                <Bar dataKey="expenses" fill={CL.red} radius={[2,2,0,0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>By Category</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 16, marginBottom: 32 }}>
            {expPie.slice().sort(function(a,b) { return b.value - a.value; }).map(function(e) { return <Card key={e.name} style={{ padding: "20px 24px", borderLeft: "3px solid " + e.color }}>
              <div style={{ fontFamily: sn, fontSize: 12, fontWeight: 500, color: e.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{e.name}</div>
              <div style={{ fontFamily: ft, fontSize: 24, fontWeight: 700, marginTop: 6 }}>{dollar(e.value)}</div>
              <div style={{ fontFamily: sn, fontSize: 12, color: CL.muted, marginTop: 2 }}>{pct(e.value, stats.totExp)}</div>
            </Card>; })}
          </div>
        </div>}

        {/* SAVINGS */}
        {tab === "savings" && <div>
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: CL.light, borderRadius: 2, overflow: "hidden", border: "1px solid " + CL.border, width: "fit-content" }}>
            {[["weekly","Weekly"],["monthly","Monthly"],["yearly","Yearly"]].map(function(pair) { var k = pair[0], v = pair[1]; return <button key={k} onClick={function() { setSavingsView(k); }} style={{ fontFamily: sn, fontSize: 13, fontWeight: savingsView === k ? 600 : 400, padding: "10px 24px", background: savingsView === k ? CL.card : "transparent", color: savingsView === k ? CL.text : CL.muted, border: "none", cursor: "pointer", borderRight: "1px solid " + CL.border }}>{v}</button>; })}
          </div>
          {function() {
            var pl = savingsView === "weekly" ? "Week" : savingsView === "monthly" ? "Month" : "Year";
            var avgR = savingsData.length > 0 ? savingsData.reduce(function(s,d) { return s + d.rate; }, 0) / savingsData.length : 0;
            var avgS = savingsData.length > 0 ? savingsData.reduce(function(s,d) { return s + d.saved; }, 0) / savingsData.length : 0;
            var best = savingsData.length > 0 ? savingsData.slice().sort(function(a,b) { return b.saved - a.saved; })[0] : null;
            var pos = savingsData.filter(function(d) { return d.saved > 0; }).length;
            return <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: CL.border, border: "1px solid " + CL.border, marginBottom: 32 }}>
              {[
                { label: "Avg " + pl + "ly Rate", value: avgR.toFixed(1) + "%", color: avgR >= 0 ? CL.green : CL.red },
                { label: "Avg Saved / " + pl, value: dollar(avgS), color: avgS >= 0 ? CL.green : CL.red },
                { label: "Best " + pl, value: best ? dollar(best.saved) : "-", sub: best ? formatSK(best.key) : "", color: CL.green },
                { label: "Positive " + pl + "s", value: pos + " / " + savingsData.length, color: CL.text },
              ].map(function(s, i) { return <div key={i} style={{ background: CL.card, padding: "24px 20px" }}>
                <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: s.color, fontFamily: ft }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, marginTop: 4 }}>{s.sub}</div>}
              </div>; })}
            </div>;
          }()}
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Savings Rate Over Time</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={savingsData.slice().reverse().map(function(d) { return Object.assign({}, d, { label: formatSK(d.key) }); })}>
                <XAxis dataKey="label" tick={{ fill: CL.muted, fontSize: 11, fontFamily: sn }} axisLine={{ stroke: CL.border }} tickLine={false} interval={savingsView === "weekly" ? 2 : 0} />
                <YAxis tick={{ fill: CL.muted, fontSize: 12, fontFamily: sn }} axisLine={false} tickLine={false} tickFormatter={function(v) { return v + "%"; }} />
                <Tooltip content={function(props) {
                  if (!props.active || !props.payload || !props.payload[0]) return null;
                  var d = props.payload[0].payload;
                  return <div style={{ background: "#fff", border: "1px solid " + CL.border, borderRadius: 2, padding: "14px 18px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontFamily: ft, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{props.label}</div>
                    <div style={{ fontFamily: sn, fontSize: 13, color: CL.green }}>Income: {dollar(d.income)}</div>
                    <div style={{ fontFamily: sn, fontSize: 13, color: CL.red }}>Spent: {dollar(d.expenses)}</div>
                    <div style={{ fontFamily: sn, fontSize: 13, color: d.saved >= 0 ? CL.green : CL.red, fontWeight: 600, marginTop: 4, paddingTop: 6, borderTop: "1px solid " + CL.light }}>Saved: {dollar(d.saved)} ({d.rate.toFixed(1)}%)</div>
                  </div>;
                }} />
                <Bar dataKey="rate" radius={[2,2,0,0]}>
                  {savingsData.slice().reverse().map(function(d, i) { return <Cell key={i} fill={d.rate >= 0 ? CL.green : CL.red} />; })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid " + CL.border, position: "sticky", top: 0, background: CL.card, zIndex: 1 }}>
                  {["Period","Income","Expenses","Saved","Rate"].map(function(h) { return <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>; })}
                </tr></thead>
                <tbody>{savingsData.map(function(d) { return <tr key={d.key} style={{ borderBottom: "1px solid " + CL.light }}>
                  <td style={{ padding: "14px 20px", fontFamily: ft, fontSize: 15, fontWeight: 500 }}>{formatSK(d.key)}</td>
                  <td style={{ padding: "14px 20px", fontFamily: ft, fontSize: 15, color: CL.green }}>{dollar(d.income)}</td>
                  <td style={{ padding: "14px 20px", fontFamily: ft, fontSize: 15, color: CL.red }}>{dollar(d.expenses)}</td>
                  <td style={{ padding: "14px 20px", fontFamily: ft, fontSize: 15, fontWeight: 600, color: d.saved >= 0 ? CL.green : CL.red }}>{dollar(d.saved)}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 60, height: 6, borderRadius: 1, background: CL.light, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 1, background: d.rate >= 0 ? CL.green : CL.red, width: Math.min(100, Math.abs(d.rate)) + "%" }} />
                      </div>
                      <span style={{ fontFamily: sn, fontSize: 13, fontWeight: 600, color: d.rate >= 0 ? CL.green : CL.red }}>{d.rate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>; })}</tbody>
              </table>
            </div>
          </Card>
        </div>}

        {/* COACHING */}
        {tab === "coaching" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: CL.border, border: "1px solid " + CL.border, marginBottom: 32 }}>
            {[
              { label: "Coaching Revenue", value: dollar(coachingStats.totalRev) },
              { label: "Total Sessions", value: String(coachingStats.totalSessions) },
              { label: "Avg Per Session", value: dollar(coachingStats.avgPerSession) },
            ].map(function(s, i) { return <div key={i} style={{ background: CL.card, padding: "24px 20px" }}>
              <div style={{ fontSize: 11, color: CL.muted, fontFamily: sn, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: CL.green, fontFamily: ft }}>{s.value}</div>
            </div>; })}
          </div>
          <Card style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Monthly Revenue</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={coachingStats.byMonth.map(function(m) { return Object.assign({}, m, { label: mLabel(m.month) }); })}>
                <XAxis dataKey="label" tick={{ fill: CL.muted, fontSize: 12, fontFamily: sn }} axisLine={{ stroke: CL.border }} tickLine={false} />
                <YAxis tick={{ fill: CL.muted, fontSize: 12, fontFamily: sn }} axisLine={false} tickLine={false} tickFormatter={function(v) { return "$" + v; }} />
                <Tooltip content={function(props) {
                  if (!props.active || !props.payload || !props.payload[0]) return null;
                  return <div style={{ background: "#fff", border: "1px solid " + CL.border, borderRadius: 2, padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontFamily: ft, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{props.label}</div>
                    <div style={{ fontFamily: sn, color: CL.green, fontSize: 13 }}>Revenue: {dollar(props.payload[0].value)}</div>
                  </div>;
                }} />
                <Bar dataKey="revenue" fill={CL.green} radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 16px" }}>Clients</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
            {coachingStats.clients.map(function(cl, i) { return <Card key={cl.name} style={{ padding: "20px 24px", borderLeft: "3px solid " + CCLIENT[i % CCLIENT.length] }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: ft, fontSize: 18, fontWeight: 700 }}>{cl.name}</span>
                <span style={{ fontFamily: sn, fontSize: 11, color: CL.muted }}>{cl.sessions} sessions</span>
              </div>
              <div style={{ fontFamily: ft, fontSize: 24, fontWeight: 700, color: CCLIENT[i % CCLIENT.length], marginTop: 8 }}>{dollar(cl.total)}</div>
              <div style={{ fontFamily: sn, fontSize: 12, color: CL.muted, marginTop: 6 }}>{dollar(cl.total / cl.sessions)} avg</div>
            </Card>; })}
          </div>
          <Card>
            <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>Recent Sessions</p>
            {txns.filter(function(t) { return t.category === "Coaching" && t.type === "income"; }).sort(function(a,b) { return b.date.localeCompare(a.date); }).slice(0,12).map(function(tx) { return <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + CL.light }}>
              <div>
                <div style={{ fontFamily: ft, fontWeight: 600, fontSize: 16 }}>{tx.item}</div>
                <div style={{ fontFamily: sn, fontSize: 12, color: CL.muted, marginTop: 2 }}>{new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{tx.cash ? " - Cash" : ""}</div>
              </div>
              <div style={{ fontFamily: ft, fontWeight: 700, color: CL.green, fontSize: 18 }}>+{dollar(tx.amount)}</div>
            </div>; })}
          </Card>
        </div>}

        {/* LEDGER */}
        {tab === "transactions" && <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Sel value={filter} onChange={function(e) { setFilter(e.target.value); }} style={{ width: "auto", minWidth: 150 }}>
              <option value="All">All Categories</option>
              {cats.map(function(c) { return <option key={c.name} value={c.name}>{c.name}</option>; })}
            </Sel>
            <Sel value={monthFilter} onChange={function(e) { setMonthFilter(e.target.value); }} style={{ width: "auto", minWidth: 150 }}>
              {months.map(function(m) { return <option key={m} value={m}>{m === "All" ? "All Months" : mLabel(m)}</option>; })}
            </Sel>
            <span style={{ fontFamily: sn, fontSize: 13, color: CL.muted }}>{filteredTxns.length} entries</span>
          </div>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 560, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid " + CL.border, position: "sticky", top: 0, background: CL.card, zIndex: 1 }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: CL.muted, fontWeight: 500, fontSize: 11, fontFamily: sn, textTransform: "uppercase", letterSpacing: "0.08em" }}>Balance</th>
                  <th style={{ padding: "14px 8px" }}></th>
                </tr></thead>
                <tbody>
                  {filteredTxns.map(function(tx) {
                    var balVal = balanceMap[tx.id];
                    var balText = tx.cash ? "-" : (balVal !== undefined ? dollar(balVal) : "");
                    return <tr key={tx.id} style={{ borderBottom: "1px solid " + CL.light }}>
                      <td style={{ padding: "12px 16px", fontFamily: sn, fontSize: 13, color: CL.muted }}>{new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}</td>
                      <td style={{ padding: "12px 16px", fontFamily: ft, fontSize: 15, fontWeight: 500 }}>{tx.item}{tx.cash ? " (Cash)" : ""}</td>
                      <td style={{ padding: "12px 16px" }}><span style={{ color: catColor(tx.category), fontSize: 13, fontFamily: sn, fontWeight: 500 }}>{tx.category}</span></td>
                      <td style={{ padding: "12px 16px", fontFamily: ft, fontWeight: 600, fontSize: 16, color: tx.type === "income" ? CL.green : tx.type === "investment" ? "#00C805" : CL.red }}>{tx.type === "income" ? "+" : "-"}{dollar(tx.amount)}</td>
                      <td style={{ padding: "12px 16px", fontFamily: ft, fontSize: 14, color: CL.muted }}>{balText}</td>
                      <td style={{ padding: "12px 8px" }}><button onClick={function() { delTxn(tx.id); }} style={{ background: "none", border: "1px solid " + CL.border, color: CL.red, cursor: "pointer", fontSize: 11, padding: "3px 8px", borderRadius: 2, fontFamily: sn }}>Delete</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>}

        {/* CATEGORIES */}
        {tab === "categories" && <div>
          <Card style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: ft, fontSize: 20, fontWeight: 600, margin: "0 0 20px" }}>New Category</p>
            <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}><Lbl>Name</Lbl><Inp value={newCat.name} onChange={function(e) { setNewCat(Object.assign({}, newCat, { name: e.target.value })); }} placeholder="Category name" /></div>
              <div style={{ minWidth: 60 }}><Lbl>Color</Lbl><input type="color" value={newCat.color} onChange={function(e) { setNewCat(Object.assign({}, newCat, { color: e.target.value })); }} style={{ width: 42, height: 42, border: "1px solid " + CL.border, borderRadius: 2, cursor: "pointer", background: "transparent", padding: 2 }} /></div>
              <div style={{ minWidth: 120 }}><Lbl>Type</Lbl>
                <Sel value={newCat.type} onChange={function(e) { setNewCat(Object.assign({}, newCat, { type: e.target.value })); }}>
                  <option value="expense">Expense</option><option value="income">Income</option><option value="investment">Investment</option>
                </Sel>
              </div>
              <button onClick={addCat} style={{ fontFamily: sn, fontSize: 13, fontWeight: 500, padding: "10px 24px", height: 42, background: CL.text, color: "#fff", border: "none", borderRadius: 2, cursor: "pointer" }}>Add</button>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {cats.map(function(c) {
              var amt = c.type === "income" ? (stats.incByCat[c.name] || 0) : c.type === "investment" ? stats.totInv : (stats.expByCat[c.name] || 0);
              var tot = c.type === "income" ? stats.totInc : c.type === "investment" ? stats.totInv : stats.totExp;
              return <Card key={c.name} style={{ padding: "20px 24px", borderLeft: "3px solid " + c.color }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: ft, fontWeight: 700, fontSize: 16, color: c.color }}>{c.name}</span>
                  <span style={{ fontFamily: sn, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: c.type === "income" ? CL.green : c.type === "investment" ? "#00C805" : CL.red }}>{c.type}</span>
                </div>
                <div style={{ fontFamily: ft, fontSize: 22, fontWeight: 700, marginTop: 8 }}>{dollar(amt)}</div>
                <div style={{ fontFamily: sn, fontSize: 12, color: CL.muted, marginTop: 2 }}>{pct(amt, tot)}</div>
                <div style={{ marginTop: 10, height: 3, borderRadius: 1, background: CL.light }}>
                  <div style={{ height: "100%", borderRadius: 1, background: c.color, width: tot > 0 ? Math.min(100, amt / tot * 100) + "%" : "0%" }} />
                </div>
              </Card>;
            })}
          </div>
        </div>}

        <p style={{ textAlign: "center", padding: "48px 0 0", fontFamily: sn, fontSize: 11, color: CL.border, letterSpacing: "0.08em" }}>
          {isOnline ? "SYNCED WITH SUPABASE" : "OFFLINE MODE"}
        </p>
      </div>
    </div>
  );
}
