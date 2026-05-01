/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const getUsers = () => JSON.parse(localStorage.getItem('crm_users') || '[]');
const saveUsers = (users) => localStorage.setItem('crm_users', JSON.stringify(users));

const STAGES = ["New", "Contacted", "Qualified", "Closed"];
const REPS = ["Admin User", "Alice Sales", "Bob Sales"];
const STAGE_COLORS = { New: "#378ADD", Contacted: "#EF9F27", Qualified: "#639922", Closed: "#1D9E75" };
const ACTIVITY_ICONS = { note: "📝", email: "📧", call: "📞" };

const INIT_LEADS = [
  { id: 1, name: "Priya Sharma", email: "priya@techcorp.in", company: "TechCorp", value: 120000, stage: "New", rep: "Alice Sales", activities: [{ id: 1, type: "note", text: "Initial contact made", date: "2026-04-20" }] },
  { id: 2, name: "Rahul Mehta", email: "rahul@startup.io", company: "Startup.io", value: 85000, stage: "Contacted", rep: "Alice Sales", activities: [{ id: 1, type: "email", text: "Sent product brochure", date: "2026-04-21" }] },
  { id: 3, name: "Sneha Iyer", email: "sneha@bigfirm.com", company: "BigFirm", value: 200000, stage: "Qualified", rep: "Bob Sales", activities: [] },
  { id: 4, name: "Karthik Rao", email: "karthik@ventures.in", company: "KV Ventures", value: 55000, stage: "Closed", rep: "Bob Sales", activities: [{ id: 1, type: "call", text: "Deal finalized on call", date: "2026-04-22" }] },
  { id: 5, name: "Divya Nair", email: "divya@solutions.co", company: "Solutions Co", value: 98000, stage: "New", rep: "Alice Sales", activities: [] },
  { id: 6, name: "Arjun Pillai", email: "arjun@enterprise.in", company: "Enterprise Ltd", value: 310000, stage: "Qualified", rep: "Bob Sales", activities: [] },
];

const EMPTY_FORM = { name: "", email: "", company: "", value: "", stage: "New", rep: "Alice Sales" };
const fmtCurrency = (v) => "₹" + (v >= 100000 ? (v / 100000).toFixed(1) + "L" : Number(v).toLocaleString("en-IN"));
function Field({ label, field, type = "text", options, form, setForm, errors }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {options ? (
        <select style={styles.input} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input style={{ ...styles.input, ...(errors[field] ? { borderColor: "#f87171" } : {}) }} type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
      )}
      {errors[field] && <p style={styles.fieldError}>{errors[field]}</p>}
    </div>
  );
}
function LeadFormModal({ lead, onClose, onSave, user }) {
  const [form, setForm] = useState(lead ? { name: lead.name, email: lead.email, company: lead.company, value: lead.value, stage: lead.stage, rep: lead.rep } : { ...EMPTY_FORM, rep: user.name });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) e.value = "Enter a valid value";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, value: Number(form.value) });
    onClose();
  };

  const Field = ({ label, field, type = "text", options, form, setForm, errors }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    {options ? (
      <select style={styles.input} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    ) : (
      <input style={{ ...styles.input, ...(errors[field] ? { borderColor: "#f87171" } : {}) }} type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
    )}
    {errors[field] && <p style={styles.fieldError}>{errors[field]}</p>}
  </div>
);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <p style={styles.modalName}>{lead ? "Edit Lead" : "Add New Lead"}</p>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Full Name" field="name" />
          <Field label="Email" field="email" type="email" />
          <Field label="Company" field="company" />
          <Field label="Deal Value (₹)" field="value" type="number" />
          <Field label="Stage" field="stage" options={STAGES} />
          {user.role === "admin" && <Field label="Assigned Rep" field="rep" options={REPS} />}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.addBtn} onClick={handleSave}>{lead ? "Save Changes" : "Add Lead"}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ lead, onClose, onConfirm }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modal, width: 380 }} onClick={e => e.stopPropagation()}>
        <p style={styles.modalName}>Delete Lead</p>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "12px 0 24px" }}>
          Are you sure you want to delete <b>{lead.name}</b> from <b>{lead.company}</b>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.addBtn, background: "#dc2626" }} onClick={() => { onConfirm(lead.id); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ActivityModal({ lead, onClose, onAddActivity }) {
  const [type, setType] = useState("note");
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAddActivity(lead.id, { id: Date.now(), type, text, date: new Date().toISOString().split("T")[0] });
    setText("");
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalName}>{lead.name}</p>
            <p style={styles.modalCompany}>{lead.company} · {lead.stage}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p style={styles.sectionLabel}>Activity timeline</p>
        <div style={styles.timeline}>
          {lead.activities.length === 0 && <p style={styles.emptyActivity}>No activities yet</p>}
          {[...lead.activities].reverse().map(a => (
            <div key={a.id} style={styles.timelineItem}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ACTIVITY_ICONS[a.type]}</span>
              <div>
                <p style={{ fontSize: 14, color: "#1e293b", fontWeight: 500, margin: 0 }}>{a.text}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{a.date} · {a.type}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={styles.sectionLabel}>Log activity</p>
        <div style={styles.logRow}>
          <select style={{ ...styles.stageSelect, width: 110 }} value={type} onChange={e => setType(e.target.value)}>
            <option value="note">Note</option>
            <option value="email">Email</option>
            <option value="call">Call</option>
          </select>
          <input style={{ ...styles.input, flex: 1 }} placeholder="Add a note, email or call log..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <button style={styles.addBtn} onClick={handleAdd}>Log</button>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = () => {
  if (!email || !password) {
    setError("Enter email and password");
    return;
  }
  const users = getUsers();
  const found = users.find(u => u.email === email && u.password === password);
  if (found) {
    onLogin({ id: found.id, name: found.name, email: found.email, role: found.role });
  } else {
    setError("Invalid email or password");
  }
};

const handleRegister = () => {
  if (!email || !password) {
    setError("Enter email and password");
    return;
  }
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    setError("Email already registered!");
    return;
  }
  const newUser = {
    id: Date.now(),
    name: email.split("@")[0],
    email,
    password,
    role: "admin"
  };
  saveUsers([...users, newUser]);
  onLogin(newUser);
};
  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20, color: "#185FA5" }}>◆</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>PipelineCRM</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Sign in to your workspace</p>
        {error && <div style={styles.errorBanner}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button style={styles.loginBtn} onClick={handleLogin}>Sign in →</button>
        <button style={{...styles.loginBtn, background: '#10b981', marginTop: 10}} onClick={handleRegister}>Register →</button>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Demo accounts</p>
          <p style={{ fontSize: 12, color: "#374151", margin: "3px 0" }}><b>admin@crm.com</b> / admin123 · Admin</p>
          <p style={{ fontSize: 12, color: "#374151", margin: "3px 0" }}><b>alice@crm.com</b> / alice123 · Sales Rep</p>
          <p style={{ fontSize: 12, color: "#374151", margin: "3px 0" }}><b>bob@crm.com</b> / bob123 · Sales Rep</p>
        </div>
      </div>
    </div>
  );
}

function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const tabs = user.role === "admin" ? ["Dashboard", "Pipeline", "Leads"] : ["Pipeline", "Leads"];
  return (
    <nav style={styles.nav}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, color: "#185FA5" }}>◆</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>PipelineCRM</span>
      </div>
      <div style={{ display: "flex", gap: 4, flex: 1, paddingLeft: 16 }}>
        {tabs.map(t => (
          <button key={t} style={{ ...styles.navTab, ...(activeTab === t ? styles.navTabActive : {}) }} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ background: "#185FA5", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{user.role}</span>
        <span style={{ color: "#cbd5e1", fontSize: 13 }}>{user.name}</span>
        <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  );
}

function Dashboard({ leads }) {
  const total = leads.length;
  const totalValue = leads.reduce((s, l) => s + l.value, 0);
  const closed = leads.filter(l => l.stage === "Closed").length;
  const conversionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : 0;
  const stageData = STAGES.map(s => ({ name: s, count: leads.filter(l => l.stage === s).length, value: leads.filter(l => l.stage === s).reduce((a, b) => a + b.value, 0) }));
  const pieData = stageData.filter(d => d.count > 0);

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Sales Dashboard</h2>
      <div style={styles.metricsRow}>
        {[{ label: "Total Leads", value: total }, { label: "Pipeline Value", value: fmtCurrency(totalValue) }, { label: "Closed Deals", value: closed }, { label: "Conversion Rate", value: conversionRate + "%" }].map(m => (
          <div key={m.label} style={styles.metricCard}>
            <p style={styles.metricLabel}>{m.label}</p>
            <p style={styles.metricValue}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Deals by stage</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Leads"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageData.map(entry => <Cell key={entry.name} fill={STAGE_COLORS[entry.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Value distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map(entry => <Cell key={entry.name} fill={STAGE_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip formatter={v => fmtCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ leads, onStageChange, onEdit, onDelete, onAdd, user }) {
  const visibleLeads = user.role === "admin" ? leads : leads.filter(l => l.rep === user.name);
  return (
    <div style={styles.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>Deal Pipeline</h2>
        <button style={styles.addLeadBtn} onClick={onAdd}>+ Add Lead</button>
      </div>
      <div style={styles.kanban}>
        {STAGES.map(stage => {
          const stageLeads = visibleLeads.filter(l => l.stage === stage);
          return (
            <div key={stage} style={styles.kanbanCol}>
              <div style={{ ...styles.kanbanHeader, borderTop: `3px solid ${STAGE_COLORS[stage]}` }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{stage}</span>
                <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 600, color: "#64748b" }}>{stageLeads.length}</span>
              </div>
              {stageLeads.map(lead => (
                <div key={lead.id} style={styles.kanbanCard}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 2 }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{lead.company}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#185FA5", marginBottom: 8 }}>{fmtCurrency(lead.value)}</p>
                  <select style={styles.stageSelect} value={lead.stage} onChange={e => onStageChange(lead.id, e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button style={styles.editBtn} onClick={() => onEdit(lead)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => onDelete(lead)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {stageLeads.length === 0 && <p style={{ color: "#cbd5e1", fontSize: 13, textAlign: "center", marginTop: 24 }}>No leads</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadsTable({ leads, onStageChange, onAddActivity, onEdit, onDelete, onAdd, user }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [activityLead, setActivityLead] = useState(null);

  const visibleLeads = (user.role === "admin" ? leads : leads.filter(l => l.rep === user.name))
    .filter(l => filterStage === "All" || l.stage === filterStage)
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>Leads</h2>
        <button style={styles.addLeadBtn} onClick={onAdd}>+ Add Lead</button>
      </div>
      <div style={styles.tableControls}>
        <input style={{ ...styles.input, width: 220 }} placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={styles.stageSelect} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="All">All stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>{["Name", "Company", "Value", "Stage", "Rep", "Activity", "Actions"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {visibleLeads.map((lead, i) => (
              <tr key={lead.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={styles.td}>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{lead.name}</span><br />
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{lead.email}</span>
                </td>
                <td style={styles.td}>{lead.company}</td>
                <td style={styles.td}>{fmtCurrency(lead.value)}</td>
                <td style={styles.td}>
                  <select style={{ ...styles.stageSelect, background: STAGE_COLORS[lead.stage] + "20", color: STAGE_COLORS[lead.stage], borderColor: STAGE_COLORS[lead.stage] + "60" }}
                    value={lead.stage} onChange={e => onStageChange(lead.id, e.target.value)}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={styles.td}>{lead.rep}</td>
                <td style={styles.td}>
                  <button style={styles.viewBtn} onClick={() => setActivityLead(lead)}>
                    📋 {lead.activities.length} log{lead.activities.length !== 1 ? "s" : ""}
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={styles.editBtn} onClick={() => onEdit(lead)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => onDelete(lead)}>🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleLeads.length === 0 && (
              <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {activityLead && (
        <ActivityModal
          lead={leads.find(l => l.id === activityLead.id)}
          onClose={() => setActivityLead(null)}
          onAddActivity={(id, activity) => { onAddActivity(id, activity); setActivityLead(leads.find(l => l.id === id)); }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState(INIT_LEADS);
  const [activeTab, setActiveTab] = useState("Pipeline");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);

  useEffect(() => { if (user?.role === "sales" && activeTab === "Dashboard") { setActiveTab("Pipeline"); } }, [user, activeTab]);
  const handleLogin = (u) => { setUser(u); setActiveTab(u.role === "admin" ? "Dashboard" : "Pipeline"); };
  const handleStageChange = (id, stage) => setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
  const handleAddActivity = (id, activity) => setLeads(prev => prev.map(l => l.id === id ? { ...l, activities: [...l.activities, activity] } : l));
  const handleAddLead = (form) => setLeads(prev => [...prev, { ...form, id: Date.now(), activities: [] }]);
  const handleEditLead = (form) => setLeads(prev => prev.map(l => l.id === editLead.id ? { ...l, ...form } : l));
  const handleDeleteLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));
  const openAdd = () => { setEditLead(null); setShowForm(true); };
  const openEdit = (lead) => { setEditLead(lead); setShowForm(true); };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={styles.app}>
      <Navbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUser(null)} />
      <main style={styles.main}>
        {activeTab === "Dashboard" && <Dashboard leads={leads} />}
        {activeTab === "Pipeline" && <Pipeline leads={leads} onStageChange={handleStageChange} onEdit={openEdit} onDelete={setDeleteLead} onAdd={openAdd} user={user} />}
        {activeTab === "Leads" && <LeadsTable leads={leads} onStageChange={handleStageChange} onAddActivity={handleAddActivity} onEdit={openEdit} onDelete={setDeleteLead} onAdd={openAdd} user={user} />}
      </main>
      {showForm && <LeadFormModal lead={editLead} user={user} onClose={() => { setShowForm(false); setEditLead(null); }} onSave={editLead ? handleEditLead : handleAddLead} />}
      {deleteLead && <DeleteModal lead={deleteLead} onClose={() => setDeleteLead(null)} onConfirm={handleDeleteLead} />}
    </div>
  );
}


const styles = {
  app: { minHeight: "100vh", background: "#f3f4f6", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" },
  page: {},
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 20, letterSpacing: "-0.4px" },
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)" },
  loginCard: { background: "#fff", borderRadius: 16, padding: "40px 36px", width: 400, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" },
  errorBanner: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  loginBtn: { width: "100%", padding: "11px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  nav: { background: "#0f172a", display: "flex", alignItems: "center", padding: "0 24px", height: 56, gap: 24 },
  navTab: { padding: "6px 16px", borderRadius: 6, background: "transparent", border: "none", color: "#94a3b8", fontSize: 14, cursor: "pointer", fontWeight: 500 },
  navTabActive: { background: "#1e293b", color: "#fff" },
  logoutBtn: { background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "5px 12px", fontSize: 13, cursor: "pointer" },
  metricsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 },
  metricCard: { background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #e5e7eb" },
  metricLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  metricValue: { fontSize: 26, fontWeight: 700, color: "#0f172a" },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  chartCard: { background: "#fff", borderRadius: 12, padding: "20px", border: "1px solid #e5e7eb" },
  chartTitle: { fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 },
  kanban: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  kanbanCol: { background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", minHeight: 300 },
  kanbanHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" },
  kanbanCard: { background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 10, border: "1px solid #e2e8f0" },
  tableControls: { display: "flex", gap: 10, marginBottom: 16 },
  tableWrap: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f1f5f9" },
  stageSelect: { padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12, cursor: "pointer", background: "#fff", color: "#374151" },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#111", boxSizing: "border-box", outline: "none" },
  fieldError: { fontSize: 11, color: "#dc2626", marginTop: 4 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 16, padding: 28, width: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" },
  modalName: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  modalCompany: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  closeBtn: { background: "#f1f5f9", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "#64748b" },
  sectionLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 },
  timeline: { marginBottom: 24, maxHeight: 200, overflowY: "auto" },
  timelineItem: { display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  emptyActivity: { color: "#d1d5db", fontSize: 13, padding: "12px 0" },
  logRow: { display: "flex", gap: 8, alignItems: "center" },
  addLeadBtn: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  addBtn: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  cancelBtn: { background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  editBtn: { background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  deleteBtn: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500 },
  viewBtn: { background: "#eff6ff", color: "#185FA5", border: "1px solid #bfdbfe", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500 },
};
