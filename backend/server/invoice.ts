import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { getSiteConfig } from '@backend/lib/content';
import { formatFee } from '@shared/lib/fees';
import { escapeHtml } from './admin/operations';

export type InvoiceRegistration = {
  reference_id: string;
  applicant_name: string;
  institution: string;
  contact_email: string;
  track: 'gimun' | 'moot-cup';
  applicant_type: string;
  participant_count: number;
  fee_display: string | null;
  amount_due: number;
  amount_paid: number;
};

/** Invoice numbers derive from the registration, so re-sending never mints a new number. */
export const invoiceNumber = (reference: string) => reference.replace(/^REG-/, 'INV-');

const today = () => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'Asia/Karachi' }).format(new Date());

function amounts(r: InvoiceRegistration, currencyTemplate: string) {
  const due = Number(r.amount_due) || 0;
  const paid = Number(r.amount_paid) || 0;
  const fmt = (n: number) => formatFee(n, currencyTemplate);
  return { due: fmt(due), paid: fmt(paid), balance: fmt(Math.max(0, due - paid)), outstanding: due - paid > 0 };
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

export async function invoicePdf(r: InvoiceRegistration) {
  const site = await getSiteConfig();
  const currency = site.fees.gimunIndividual;
  const money = amounts(r, currency);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(
    await readFile(path.join(process.cwd(), 'shared/assets/fonts/GeneralSans-Variable.woff2')),
    { subset: true }
  );
  const supported = new Set(font.getCharacterSet());
  // Replace glyphs the font lacks rather than failing the whole invoice.
  const safe = (text: string) => [...text].map((c) => (supported.has(c.codePointAt(0)!) ? c : '?')).join('');
  const page: PDFPage = doc.addPage([595, 842]);
  const ink = rgb(0.12, 0.1, 0.09);
  const muted = rgb(0.42, 0.38, 0.35);
  const draw = (text: string, x: number, y: number, size = 11, color = ink) =>
    page.drawText(safe(text), { x, y, size, font, color });

  draw(site.eventNames.combined, 48, 780, 18);
  draw(site.hostInstitution, 48, 760, 9, muted);
  draw('INVOICE', 440, 780, 18);
  draw(invoiceNumber(r.reference_id), 440, 762, 10, muted);
  draw(`Date: ${today()}`, 440, 748, 10, muted);

  draw('Bill to', 48, 710, 9, muted);
  draw(r.applicant_name, 48, 694, 12);
  draw(r.institution, 48, 678, 10, muted);
  draw(r.contact_email, 48, 664, 10, muted);
  draw(`Registration reference: ${r.reference_id}`, 48, 640, 10);

  page.drawLine({ start: { x: 48, y: 612 }, end: { x: 547, y: 612 }, thickness: 1, color: muted });
  draw('Description', 48, 596, 9, muted);
  draw('Amount', 460, 596, 9, muted);
  const track = r.track === 'gimun' ? 'GIMUN' : 'GMC';
  const description = `${track} registration (${r.applicant_type}, ${r.participant_count} participant${r.participant_count === 1 ? '' : 's'})`;
  draw(description, 48, 576, 11);
  if (r.fee_display) draw(r.fee_display, 48, 562, 9, muted);
  draw(money.due, 460, 576, 11);
  page.drawLine({ start: { x: 48, y: 546 }, end: { x: 547, y: 546 }, thickness: 1, color: muted });
  draw('Paid to date', 330, 526, 10, muted);
  draw(money.paid, 460, 526, 10);
  draw('Balance due', 330, 506, 12);
  draw(money.balance, 460, 506, 12);

  let y = 460;
  draw('How to pay', 48, y, 12);
  y -= 18;
  const instructions =
    site.paymentInstructions ||
    'Bank transfer details will be shared by the organizing team. Reply to this email if you have not received them.';
  for (const line of wrap(safe(instructions), font, 10, 499)) {
    draw(line, 48, y, 10);
    y -= 14;
  }
  y -= 8;
  for (const line of wrap(`Quote ${r.reference_id} as the payment reference so your payment can be matched.`, font, 10, 499)) {
    draw(line, 48, y, 10, muted);
    y -= 14;
  }
  draw(`Questions: ${site.contactEmails.general}`, 48, 60, 9, muted);
  return new Uint8Array(await doc.save());
}

export async function invoiceEmailHtml(r: InvoiceRegistration) {
  const site = await getSiteConfig();
  const money = amounts(r, site.fees.gimunIndividual);
  const instructions = site.paymentInstructions
    ? escapeHtml(site.paymentInstructions).replace(/\n/g, '<br />')
    : 'Bank transfer details will be shared by the organizing team. Reply to this email if you have not received them.';
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f1a17;max-width:560px">
<p>Hello ${escapeHtml(r.applicant_name)},</p>
<p>Your invoice <strong>${escapeHtml(invoiceNumber(r.reference_id))}</strong> for registration <strong>${escapeHtml(r.reference_id)}</strong> is attached.</p>
<table style="border-collapse:collapse;margin:12px 0">
<tr><td style="padding:4px 16px 4px 0;color:#6b615a">Amount due</td><td><strong>${escapeHtml(money.due)}</strong></td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#6b615a">Paid to date</td><td>${escapeHtml(money.paid)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#6b615a">Balance</td><td><strong>${escapeHtml(money.balance)}</strong></td></tr>
</table>
<p><strong>How to pay</strong><br />${instructions}</p>
<p>Please quote <strong>${escapeHtml(r.reference_id)}</strong> as the payment reference.</p>
<p>Questions: <a href="mailto:${escapeHtml(site.contactEmails.general)}">${escapeHtml(site.contactEmails.general)}</a></p>
</div>`;
}
