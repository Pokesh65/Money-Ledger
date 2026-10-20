import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { Plus, FileText, FileSpreadsheet, Trash2, Search, Upload, Info, Github, Linkedin, X, Mail, GlobeLockIcon, LucideGlobe, Globe2, LucideGlobe2, Globe2Icon } from 'lucide-react';
import { OPS, OPCLS, OPNAME, uid, fmt, loadRows, saveRows, loadMeta, saveMeta, calculateLedger, exportExcel, exportPdf, importFile } from './utils.js';

// ✏️ Edit your details here
const DEVELOPER = {
  name: 'Pokesh Kumar V',
  role: 'Full Stack Developer',
  email: 'mailto:pokesh65@gmail.com',
  github: 'https://github.com/Pokesh65',
  linkedin: 'https://www.linkedin.com/in/pokesh-kumar-v',
  portfolio: 'https://pokesh-kumar-full-stack-developer.netlify.app/',
};



function DeveloperDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const link = 'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--soft)]';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,20,20,.5)' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="dvt" className="card pop p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--mute)' }}>Created by</div>
            <h2 id="dvt" className="text-xl font-extrabold mt-0.5">{DEVELOPER.name}</h2>
            <div className="text-sm" style={{ color: 'var(--mute)' }}>{DEVELOPER.role}</div>
          </div>
          <button ref={ref} className="icon" aria-label="Close developer details" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-2">
          <a className={link} style={{ borderColor: 'var(--line)' }} href={DEVELOPER.email} target="_blank" rel="noopener noreferrer"><Mail size={18} /> Email</a>
          <a className={link} style={{ borderColor: 'var(--line)' }} href={DEVELOPER.github} target="_blank" rel="noopener noreferrer"><Github size={18} /> GitHub</a>
          <a className={link} style={{ borderColor: 'var(--line)' }} href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} /> LinkedIn</a>
          <a className={link} style={{ borderColor: 'var(--line)' }} href={DEVELOPER.portfolio} target="_blank" rel="noopener noreferrer"><Globe2Icon size={18} /> Portfolio</a>
        </div>
      </div>
    </div>
  );
}

const Row = memo(function Row({ r, i, onChange, onRemove, onEnter }) {
  return (
    <div className="rowgrid rin px-4 md:px-5 py-3 border-t" style={{ borderColor: 'var(--line)' }} data-row={i}>
      <div className="c-n pt-2.5 md:text-sm" style={{ color: 'var(--mute)' }}>#{i + 1}</div>
      <div className="c-m">
        <label className="lbl" htmlFor={'m' + r.id}>Member</label>
        <input id={'m' + r.id} data-f="member" className="field" placeholder="Enter member name" value={r.member}
          onChange={(e) => onChange(r.id, { member: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.closest('[data-row]').querySelector('[data-f=amount]').focus(); } }} />
      </div>
      <div className="c-a">
        <label className="lbl" htmlFor={'a' + r.id}>Amount</label>
        <div className={'flex rounded-[10px] ' + OPCLS[r.operation]}>
          <select className="opsel" aria-label={`Operation for row ${i + 1}: ${OPNAME[r.operation]}`} value={r.operation}
            onChange={(e) => onChange(r.id, { operation: e.target.value })}>
            {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input id={'a' + r.id} data-f="amount" inputMode="decimal" className={'field amt' + (r.invalid ? ' !border-red-500' : '')}
            placeholder="Enter amount" value={r.amount} aria-invalid={r.invalid}
            onChange={(e) => { const v = e.target.value; if (/^\d*\.?\d{0,2}$/.test(v)) onChange(r.id, { amount: v }); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(i); } }} />
        </div>
        <div className="text-xs mt-1.5 pop" key={r.balance} style={{ color: r.invalid ? '#dc2626' : 'var(--mute)' }}>
          {r.invalid ? 'Cannot divide by zero — row skipped. ' : ''}Running balance: <b style={{ color: 'var(--ink)' }}>{fmt(r.balance)}</b>
        </div>
      </div>
      <div className="c-d text-right">
        <button className="icon" aria-label={`Remove row ${i + 1}${r.member ? ' (' + r.member + ')' : ''}`} onClick={() => onRemove(r.id)}><Trash2 size={18} /></button>
      </div>
    </div>
  );
});

function Confirm({ onCancel, onOk, title = 'Clear all ledger entries?', text = 'This action cannot be undone.', okLabel = 'Clear All' }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,20,20,.5)' }} onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="ct" aria-describedby="cd" className="card pop p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 id="ct" className="text-lg font-bold">{title}</h2>
        <p id="cd" className="mt-1 text-sm" style={{ color: 'var(--mute)' }}>{text}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={ref} className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background: '#b91c1c', color: '#fff', borderColor: '#b91c1c' }} onClick={onOk}>{okLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState(loadRows);
  const [meta, setMeta] = useState(loadMeta);
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const [pending, setPending] = useState(null);
  const [devOpen, setDevOpen] = useState(false);
  const fileRef = useRef(null);
  const focusId = useRef(null);

  useEffect(() => { saveRows(rows); }, [rows]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 3500); }, []);

  const calc = useMemo(() => calculateLedger(rows), [rows]);

  const total = calc.length ? calc[calc.length - 1].balance : 0;

  const { added, deducted } = useMemo(() => {
    let a = 0, d = 0;
    rows.forEach((r) => { const n = Number(r.amount) || 0; if (r.operation === '+') a += n; else if (r.operation === '−') d += n; });
    return { added: a, deducted: d };
  }, [rows]);

  const needle = q.trim().toLowerCase();
  const visible = useMemo(() => calc.map((r, i) => ({ r, i })).filter((x) => !needle || x.r.member.toLowerCase().includes(needle)), [calc, needle]);

  const addRow = useCallback(() => {
    const id = uid(); focusId.current = id;
    setRows((rs) => [...rs, { id, member: '', operation: '+', amount: '' }]);
    setQ('');
  }, []);

  useEffect(() => {
    if (focusId.current) {
      const el = document.getElementById('m' + focusId.current);
      if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); focusId.current = null; }
    }
  }, [rows]);
  const change = useCallback((id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))), []);
  const remove = useCallback((id) => setRows((rs) => rs.filter((r) => r.id !== id)), []);
  const enter = useCallback((i) => {
    const next = document.querySelector(`[data-row="${i + 1}"] [data-f=member]`);
    if (next) next.focus(); else addRow();
  }, [addRow]);

  const applyImport = (d) => {
    setRows(d.rows.map((r) => ({ ...r, id: uid() })));
    setMeta(d.meta); setPending(null); setQ('');
    notify(`Imported ${d.rows.length} ${d.rows.length === 1 ? 'entry' : 'entries'}`);
  };
  const onImportFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const d = await importFile(f);
      if (!rows.length && !meta.title && !meta.description) applyImport(d); else setPending(d);
    } catch (err) { console.error(err); notify(err.message || 'Could not import this file'); }
  };

  const onPdf = async () => { try { await exportPdf(calc, total, meta); notify('PDF downloaded'); } catch (e) { console.error(e); notify('Could not create the PDF'); } };
  const onExcel = () => { try { exportExcel(calc, total, meta); notify('Excel file downloaded'); } catch (e) { console.error(e); notify('Could not create the Excel file'); } };

  const stat = (label, val, sub) => (
    <div className="card p-4">
      <div className="text-sm" style={{ color: 'var(--mute)' }}>{label}</div>
      <div className="text-2xl font-extrabold mt-1">{val}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--mute)' }}>{sub}</div>
    </div>
  );
  const disabled = { disabled: !rows.length, style: { opacity: rows.length ? 1 : 0.5 } };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Money Ledger</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mute)' }}>Track member-wise money transactions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={addRow}><Plus size={18} /> Add Member</button>
          <button className="btn" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={18} /> Import</button>
          <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,application/pdf" className="hidden" aria-label="Import a ledger PDF or Excel file" onChange={onImportFile} />
          <button className="btn" {...disabled} onClick={onPdf}><FileText size={18} /> Export PDF</button>
          <button className="btn" {...disabled} onClick={onExcel}><FileSpreadsheet size={18} /> Export Excel</button>
        </div>
      </header>

      <section className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-3" aria-label="Summary">
        {stat('Total Members', rows.length, 'Members')}
        {stat('Total Added', fmt(added), 'Added')}
        {stat('Total Deducted', fmt(deducted), 'Deducted')}
      </section>

      <section className="mt-3 card overflow-hidden" aria-live="polite" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' }}>
        <div className="p-5 md:p-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold opacity-80">Current Balance</div>
            <div className="text-4xl md:text-6xl font-extrabold tracking-tight mt-1 pop" key={total}>{total < 0 ? '−' : ''}{fmt(Math.abs(total))}</div>
            <div className="text-sm mt-2 opacity-80">{rows.length ? `After ${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}` : 'No entries yet'}{total < 0 ? ' · Balance is negative' : ''}</div>
          </div>
          <div className="w-full md:w-72">
            <div className="flex justify-between text-sm font-semibold"><span>+ {fmt(added)}</span><span>− {fmt(deducted)}</span></div>
            <div className="mt-2 h-2.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,.25)' }} role="img" aria-label={`Added ${fmt(added)}, deducted ${fmt(deducted)}`}>
              <div style={{ width: (added + deducted ? (added / (added + deducted)) * 100 : 50) + '%', background: 'currentColor', transition: 'width .3s' }} />
            </div>
            <div className="flex justify-between text-xs mt-1.5 opacity-80"><span>Added</span><span>Deducted</span></div>
          </div>
        </div>
      </section>

      <section className="card mt-6 p-4 md:p-5" aria-label="Statement details">
        <h2 className="font-bold">Statement title and description</h2>
        <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--mute)' }}>Optional. Shown in the PDF and Excel file only when filled in.</p>
        <label className="lbl !block" htmlFor="mt">Title</label>
        <input id="mt" className="field" placeholder="e.g. Monthly chit collection" value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} />
        <label className="lbl !block mt-3" htmlFor="md">Description</label>
        <textarea id="md" rows="2" className="field" placeholder="e.g. Collection for October 2026" value={meta.description} onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))} />
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="p-4 md:p-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[12rem]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--mute)' }}><Search size={18} /></span>
            <input type="search" aria-label="Search members" className="field" style={{ paddingLeft: '2.25rem' }} placeholder="Search members..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {rows.length > 0 && <button className="text-sm underline underline-offset-2 px-1" style={{ color: 'var(--mute)' }} onClick={() => setConfirm(true)}>Clear All</button>}
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 px-6 border-t" style={{ borderColor: 'var(--line)' }}>
            <div className="text-lg font-bold">No members yet</div>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--mute)' }}>Start tracking your money by adding your first member.</p>
            <button className="btn btn-primary" onClick={addRow}><Plus size={18} /> Add Member</button>
          </div>
        ) : (
          <>
            <div className="rowgrid hd px-5 py-2 text-xs font-semibold border-t" style={{ color: 'var(--mute)', borderColor: 'var(--line)', background: 'var(--soft)' }}>
              <div>S.No</div><div>Member</div><div>Amount</div><div />
            </div>
            {visible.length === 0
              ? <div className="py-10 text-center text-sm border-t" style={{ color: 'var(--mute)', borderColor: 'var(--line)' }}>No members match “{q}”. Totals still include all {rows.length} rows.</div>
              : visible.map(({ r, i }) => <Row key={r.id} r={r} i={i} onChange={change} onRemove={remove} onEnter={enter} />)}
            <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold border-t border-dashed transition-colors hover:bg-[var(--soft)]" style={{ borderColor: 'var(--line)', color: 'var(--accent)' }} onClick={addRow}>
              <Plus size={18} /> Add Member
            </button>
            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-t-2" style={{ borderColor: 'var(--accent)', background: 'var(--soft)' }}>
              <div>
                <div className="font-extrabold text-lg">Total</div>
                <div className="text-xs" style={{ color: 'var(--mute)' }}>All {rows.length} {rows.length === 1 ? 'entry' : 'entries'}{needle ? ' (search does not change this)' : ''}</div>
              </div>
              <div className="text-3xl font-extrabold px-4 py-1.5 rounded-xl pop" key={total} style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{total < 0 ? '−' : ''}{fmt(Math.abs(total))}</div>
            </div>
          </>
        )}
      </section>

      <section className="flex flex-wrap items-center mt-5 justify-between gap-4">
        <button className="btn" {...disabled} onClick={onPdf}><FileText size={18} /> Export PDF</button>
        <button className="btn" {...disabled} onClick={onExcel}><FileSpreadsheet size={18} /> Export Excel</button>
      </section>

      <footer className="mt-10 mb-2 flex items-center justify-center gap-1.5 text-sm" style={{ color: 'var(--mute)' }}>
        <span>Created by <b style={{ color: 'var(--ink)' }}><button onClick={() => setDevOpen(true)} className='hover:text-blue-500 transition-all hover:text-[15px]'>{DEVELOPER.name}</button></b></span>
      </footer>

      {devOpen && <DeveloperDialog onClose={() => setDevOpen(false)} />}
      {toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 card px-4 py-2 text-sm font-semibold pop" style={{ boxShadow: '0 6px 24px rgba(0,0,0,.18)' }}>{toast}</div>}
      {pending && <Confirm title="Replace current ledger?" text={`Importing will replace your current entries with ${pending.rows.length} from the file.`} okLabel="Replace" onCancel={() => setPending(null)} onOk={() => applyImport(pending)} />}
      {confirm && <Confirm onCancel={() => setConfirm(false)} onOk={() => { setRows([]); setConfirm(false); }} />}
    </main>
  );
}