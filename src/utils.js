import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const OPS = ['+', '−', '×', '÷'];
export const OPCLS = { '+': 'op-plus', '−': 'op-minus', '×': 'op-mul', '÷': 'op-div' };
export const OPNAME = { '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' };

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now() + Math.random().toString(36).slice(2));

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const fmt = (n) => inr.format(Math.round((Number.isFinite(n) ? n : 0) * 100) / 100);

const KEY = 'money-ledger:rows:v1';
const META_KEY = 'money-ledger:meta:v1';

export function loadRows() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(d)) return [];
    return d.filter((r) => r && typeof r === 'object').map((r) => ({
      id: String(r.id || uid()),
      member: String(r.member || ''),
      operation: OPS.includes(r.operation) ? r.operation : r.operation === '-' ? '−' : '+',
      amount: r.amount == null ? '' : String(r.amount),
    }));
  } catch { return []; }
}
export const saveRows = (rows) => { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { } };

export function loadMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY));
    return { title: String((m && m.title) || ''), description: String((m && m.description) || '') };
  } catch { return { title: '', description: '' }; }
}
export const saveMeta = (m) => { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { } };

// Each row applies its operation to the running result of the previous row (first row starts at 0).
export function calculateLedger(rows) {
  let bal = 0;
  return rows.map((r) => {
    const a = Number(r.amount) || 0;
    let invalid = false;
    if (r.operation === '+') bal += a;
    else if (r.operation === '−') bal -= a;
    else if (r.operation === '×') bal *= a;
    else if (r.operation === '÷') { if (a === 0) invalid = r.amount !== ''; else bal /= a; }
    return { ...r, balance: bal, invalid };
  });
}

// ---- Hidden copy of the ledger stored inside exported PDFs (so they can be re-imported) ----
const MARK = 'MONEYLEDGER:';
const toB64 = (obj) => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const fromB64 = (b64) => {
  const bin = atob(b64);
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
};

function cleanRows(list) {
  return list.map((r) => {
    const op = r.operation === '-' ? '−' : r.operation;
    const amt = r.amount == null ? '' : String(r.amount).trim();
    return { member: String(r.member || ''), operation: OPS.includes(op) ? op : '+', amount: /^\d*\.?\d*$/.test(amt) ? amt : '' };
  });
}

// Reads a ledger back from a PDF exported by this app, or from its Excel export.
export async function importFile(file) {
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();
  if (name.endsWith('.pdf')) {
    const text = new TextDecoder('latin1').decode(new Uint8Array(buf));
    const m = text.match(/MONEYLEDGER:([A-Za-z0-9+/=]+)/);
    if (!m) throw new Error('This PDF has no saved ledger data. Import a PDF exported from this updated app, or the Excel file instead.');
    const d = fromB64(m[1]);
    return { rows: cleanRows(d.rows || []), meta: { title: String(d.title || ''), description: String(d.description || '') } };
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const wb = XLSX.read(buf, { type: 'array' });
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
    const h = aoa.findIndex((r) => String(r[0]).trim() === 'S.No');
    if (h < 0) throw new Error('This Excel file is not a Money Ledger export.');
    const top = aoa.slice(0, h).map((r) => String(r[0] || '').trim()).filter(Boolean);
    const body = [];
    for (const r of aoa.slice(h + 1)) {
      if (String(r[1]).trim().toUpperCase() === 'TOTAL') break;
      if (r.every((c) => c === '')) continue;
      body.push({ member: r[1], operation: String(r[2]).trim(), amount: r[3] });
    }
    return { rows: cleanRows(body), meta: { title: top[0] || '', description: top[1] || '' } };
  }
  throw new Error('Please choose a PDF or Excel (.xlsx) file.');
}

const dateStamp = () => new Date().toISOString().slice(0, 10);

export function exportExcel(calc, total, meta) {
  const data = [];
  if (meta.title.trim()) data.push([meta.title.trim()]);
  if (meta.description.trim()) data.push([meta.description.trim()]);
  if (data.length) data.push([]);
  data.push(['S.No', 'Member', 'Operation', 'Amount', 'Running Balance']);
  calc.forEach((r, i) => data.push([i + 1, r.member, r.operation, Number(r.amount) || 0, r.balance]));
  data.push([], ['', 'TOTAL', '', '', total]);
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 10 }, { wch: 14 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
  XLSX.writeFile(wb, `money-ledger-${dateStamp()}.xlsx`);
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// symbol in front of the amount: "+ ₹5,000.00", "× 2"
const amountText = (r) => {
  const n = Number(r.amount) || 0;
  return r.operation + ' ' + (r.operation === '+' || r.operation === '−' ? fmt(n) : String(n));
};

export async function exportPdf(calc, total, meta) {
  const title = meta.title.trim(), desc = meta.description.trim();
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const td = 'padding:8px 10px;border-bottom:1px solid #999;';
  const th = td + 'border-bottom:2px solid #000;';
  const rowsHtml = calc.map((r, i) =>
    `<tr><td style="${td}">${i + 1}</td><td style="${td}">${esc(r.member || '—')}</td><td style="${td}text-align:right;white-space:nowrap">${esc(amountText(r))}</td></tr>`).join('');

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;left:0;top:0;z-index:-1;width:794px;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:16px';
  wrap.innerHTML =
    (title ? `<h1 style="margin:0 0 6px;font-size:28px">${esc(title)}</h1>` : '') +
    (desc ? `<p style="margin:0 0 10px;white-space:pre-wrap;color:#333">${esc(desc)}</p>` : '') +
    `<p style="margin:0 0 14px;font-size:13px;color:#555">Date: ${today}</p>` +
    `<table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}text-align:left">S.No</th><th style="${th}text-align:left">Member</th><th style="${th}text-align:right">Amount</th></tr></thead><tbody>${rowsHtml}</tbody>` +
    `<tfoot><tr><td colspan="2" style="padding:10px;font-weight:800;border-top:2px solid #000">TOTAL</td><td style="padding:10px;font-weight:800;text-align:right;border-top:2px solid #000;white-space:nowrap">${esc(fmt(total))}</td></tr></tfoot></table>`;
  document.body.appendChild(wrap);

  try {
    const W = 794, scale = 2;
    const canvas = await html2canvas(wrap, { scale, backgroundColor: '#ffffff', width: W, windowWidth: W, scrollX: 0, scrollY: 0 });
    const wrapTop = wrap.getBoundingClientRect().top;
    const totalH = wrap.offsetHeight;
    const bottoms = [...wrap.querySelectorAll('tr')].map((tr) => tr.getBoundingClientRect().bottom - wrapTop);
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfW = 515, pageHpt = 762;
    const pxPerPt = W / pdfW, pageHpx = pageHpt * pxPerPt;
    let start = 0, first = true;
    while (start < totalH - 1) {
      let end = Math.min(start + pageHpx, totalH);
      if (end < totalH) { // break pages between rows, never through a row
        const fit = bottoms.filter((b) => b > start + 20 && b <= end);
        if (fit.length) end = fit[fit.length - 1];
      }
      const sh = Math.max(1, Math.round((end - start) * scale));
      const slice = document.createElement('canvas');
      slice.width = canvas.width; slice.height = sh;
      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, slice.width, sh);
      ctx.drawImage(canvas, 0, Math.round(start * scale), canvas.width, sh, 0, 0, canvas.width, sh);
      if (!first) doc.addPage();
      doc.addImage(slice.toDataURL('image/png'), 'PNG', 40, 40, pdfW, (end - start) / pxPerPt);
      first = false; start = end;
    }
    doc.setProperties({ subject: MARK + toB64({ v: 1, title, description: desc, rows: calc.map((r) => ({ member: r.member, operation: r.operation, amount: r.amount })) }) });
    doc.save(`money-ledger-${dateStamp()}.pdf`);
  } finally { wrap.remove(); }
}