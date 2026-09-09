'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { scaleIn } from '@/lib/motion';
import { getCanonicalEventDateRange, getCanonicalVenue, getEventYear } from '@/lib/site-config';

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

interface RegistrationSuccessProps {
  referenceId: string;
  applicantName: string;
  track: 'gimun' | 'moot-cup';
  applicantType: 'individual' | 'delegation' | 'team';
  details?: {
    email?: string;
    institution?: string;
    phone?: string;
    summary?: string;
    feeAmount?: string;
    eventDates?: string;
    venue?: string;
    participantCount?: number;
    timestamp?: string;
  };
  onReset?: () => void;
}

export function RegistrationSuccess({
  referenceId,
  applicantName,
  track,
  applicantType,
  details,
  onReset,
}: RegistrationSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');

  const isMoot = track === 'moot-cup';
  const trackLabel = isMoot ? 'GIKI Moot Court (GMC)' : 'GIKI Model United Nations (GIMUN)';
  const trackNameShort = isMoot ? 'GMC' : 'GIMUN';
  const typeLabel =
    applicantType === 'individual'
      ? 'Individual Delegate'
      : applicantType === 'delegation'
      ? `Institutional Delegation (${details?.participantCount || 1} Delegates)`
      : `Advocacy Team (${details?.participantCount || 3} Advocates)`;

  const feeDisplay =
    details?.feeAmount ||
    (isMoot ? 'PKR 12,000' : applicantType === 'individual' ? 'PKR 4,500' : 'PKR 4,000 / delegate');

  const eventDates = details?.eventDates || getCanonicalEventDateRange();
  const venueTitle = details?.venue || getCanonicalVenue();
  const eventYear = getEventYear();
  const submittedDate = details?.timestamp ? new Date(details.timestamp) : null;

  const formattedDate = submittedDate && Number.isFinite(submittedDate.getTime())
    ? new Intl.DateTimeFormat('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: 'Asia/Karachi',
      }).format(submittedDate)
    : 'Timestamp pending';

  useEffect(() => {
    if (referenceId) {
      const qrReference = /^[A-Z0-9-]{1,100}$/.test(referenceId) ? referenceId : 'INVALID-REFERENCE';
      QRCode.toString(
        qrReference,
        {
          type: 'svg',
          margin: 1,
          width: 140,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, string) => {
          if (!err && string) {
            setQrSvg(string);
          }
        }
      );
    }
  }, [referenceId]);

  const handleCopy = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.title = `SOPHEP_Voucher_${referenceId}`;
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(generateVoucherDocumentHtml(true));
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            window.print();
          } finally {
            setTimeout(() => {
              try {
                document.body.removeChild(iframe);
              } catch {}
            }, 2000);
          }
        }, 300);
        return;
      }
    } catch {
      window.print();
    }
  };

  const generateVoucherDocumentHtml = (isPrintOnly: boolean = false) => {
    const safeReferenceId = escapeHtml(referenceId);
    const safeApplicantName = escapeHtml(applicantName);
    const safeInstitution = escapeHtml(details?.institution || 'Not specified');
    const safeEmail = escapeHtml(details?.email || 'Registered email');
    const safePhone = escapeHtml(details?.phone || 'On file');
    const safeSummary = escapeHtml(details?.summary || (isMoot ? 'Appellate Moot Court Roster' : 'Standard Committee Preference'));
    const safeFeeDisplay = escapeHtml(feeDisplay);
    const safeTypeLabel = escapeHtml(typeLabel);
    const safeEventDates = escapeHtml(eventDates);
    const safeVenueTitle = escapeHtml(venueTitle);
    const safeFormattedDate = escapeHtml(formattedDate);
    const safeTrackLabel = escapeHtml(trackLabel);
    const safeTrackShort = escapeHtml(trackNameShort);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SOPHEP_Voucher_${safeReferenceId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: ${isPrintOnly ? '#ffffff' : '#0a0d14'};
      color: #0f172a;
      font-size: 10.5px;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
    }
    .top-action-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
      font-size: 12px;
    }
    .top-bar-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: monospace;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 0.5px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .top-bar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-print {
      background: #fbbf24;
      color: #000000;
      border: none;
      padding: 8px 18px;
      font-weight: 800;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-print:hover {
      background: #f59e0b;
      transform: translateY(-1px);
    }
    .btn-copy {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 7px 14px;
      font-weight: 600;
      font-size: 11px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-copy:hover {
      background: #334155;
    }
    .page-wrap {
      padding: ${isPrintOnly ? '0' : '28px 16px 40px'};
      display: flex;
      justify-content: center;
    }
    .voucher-card {
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0,0,0,0.15);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .dark-header {
      background: #090d16 !important;
      color: #ffffff !important;
      padding: 14px 20px 12px !important;
      text-align: center !important;
      border-bottom: 3px solid #fbbf24 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .gold-badge {
      display: inline-block !important;
      background: #fbbf24 !important;
      color: #000000 !important;
      font-weight: 900 !important;
      letter-spacing: 4px !important;
      padding: 3px 16px !important;
      border-radius: 3px !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      margin-bottom: 6px !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .pill {
      display: inline-block !important;
      background: rgba(255,255,255,0.12) !important;
      border: 1px solid rgba(255,255,255,0.25) !important;
      color: #f8fafc !important;
      font-family: monospace !important;
      font-weight: 700 !important;
      font-size: 9px !important;
      padding: 2px 10px !important;
      border-radius: 9999px !important;
      letter-spacing: 1.2px !important;
      text-transform: uppercase !important;
      margin-bottom: 4px !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .track-title {
      font-size: 16px !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      margin: 4px 0 2px 0 !important;
      color: #ffffff !important;
    }
    .track-sub {
      font-size: 9.5px !important;
      color: #94a3b8 !important;
      margin: 0 !important;
    }
    .voucher-content {
      padding: 14px 18px;
    }
    .intro-block {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .intro-block h2 {
      margin: 0 0 2px 0;
      font-size: 15px;
      color: #0f172a;
      font-weight: 800;
    }
    .intro-block p {
      margin: 0;
      color: #475569;
      font-size: 10.5px;
      line-height: 1.35;
    }
    .qr-pass-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 9px 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      -webkit-print-color-adjust: exact !important;
    }
    .qr-info {
      flex: 1;
      min-width: 0;
    }
    .qr-badge {
      font-size: 8.5px;
      font-family: monospace;
      font-weight: 800;
      color: #4338ca;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .qr-ref {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 17px;
      font-weight: 900;
      color: #1e1b4b;
      margin: 1px 0 2px 0;
      letter-spacing: 0.5px;
    }
    .qr-notice {
      font-size: 9.5px;
      color: #64748b;
      line-height: 1.3;
    }
    .qr-visual {
      background: #ffffff;
      border: 1.5px solid #0f172a;
      padding: 4px;
      border-radius: 6px;
      text-align: center;
      flex-shrink: 0;
      width: 86px;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      -webkit-print-color-adjust: exact !important;
    }
    .qr-svg {
      width: 72px;
      height: 72px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .qr-svg svg {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      display: block !important;
    }
    .qr-label {
      font-family: monospace;
      font-size: 7.5px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .dossier-card {
      margin-bottom: 10px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    .dossier-card-header {
      background: #0f172a !important;
      color: #ffffff !important;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .dossier-title {
      font-family: monospace;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .status-pill {
      background: #fef3c7 !important;
      color: #92400e !important;
      font-weight: 800;
      font-size: 8.5px;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      border: 1px solid #fcd34d;
      letter-spacing: 0.5px;
      display: inline-block;
      -webkit-print-color-adjust: exact !important;
    }
    .dossier-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .dossier-table th {
      background: #f8fafc;
      font-weight: 600;
      width: 26%;
      color: #475569;
      padding: 4.5px 10px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      text-align: left;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.3px;
    }
    .dossier-table td {
      color: #0f172a;
      padding: 4.5px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10px;
      background: #ffffff;
    }
    .dossier-table tr:nth-child(even) td {
      background: #fafafa;
    }
    .dossier-table tr:last-child th, .dossier-table tr:last-child td {
      border-bottom: none;
    }
    .event-card {
      background: #fffdf5 !important;
      border: 1px solid #fde68a;
      border-left: 3.5px solid #f59e0b !important;
      padding: 7px 11px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 9.5px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact !important;
    }
    .event-card-title {
      font-weight: 800;
      font-size: 9.5px;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .notice-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 9px;
      color: #475569;
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .signatures-block {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1.5px dashed #cbd5e1;
    }
    .sign-col {
      width: 45%;
      font-size: 9px;
      color: #475569;
    }
    .sign-line {
      border-bottom: 1.5px solid #0f172a;
      height: 24px;
      margin-bottom: 4px;
    }
    .footer-stamp {
      text-align: center;
      font-size: 8px;
      color: #94a3b8;
      margin-top: 8px;
      border-top: 1px solid #f1f5f9;
      padding-top: 5px;
      font-family: monospace;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      body {
        background: #ffffff !important;
        font-size: 9.5px !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .top-action-bar {
        display: none !important;
      }
      .page-wrap {
        padding: 0 !important;
        margin: 0 !important;
      }
      .voucher-card {
        max-width: 100% !important;
        margin: 0 !important;
        border: 1.5px solid #0f172a !important;
        box-shadow: none !important;
        border-radius: 6px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .dark-header {
        background: #090d16 !important;
        padding: 12px 16px 10px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .gold-badge {
        background: #fbbf24 !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pill {
        background: rgba(255, 255, 255, 0.15) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .voucher-content {
        padding: 10px 14px !important;
      }
      .qr-pass-box {
        background: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .dossier-card-header {
        background: #0f172a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .status-pill {
        background: #fef3c7 !important;
        color: #92400e !important;
        border-color: #fcd34d !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .event-card {
        background: #fffdf5 !important;
        border-left: 3.5px solid #f59e0b !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  ${
    isPrintOnly
      ? ''
      : `
  <div class="top-action-bar">
    <div class="top-bar-badge">
      <span class="pulse-dot"></span>
      <span>OFFICIAL SOPHEP DIGITAL CREDENTIAL · VERIFIED DOSSIER</span>
    </div>
    <div class="top-bar-actions">
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${safeReferenceId}'); this.innerText='✓ Copied!'; setTimeout(()=>this.innerText='📋 Copy Reference', 2000);">
        📋 Copy Reference
      </button>
      <button class="btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF (Single A4)
      </button>
    </div>
  </div>
  `
  }

  <div class="page-wrap">
    <div class="voucher-card">
      <div class="dark-header">
        <div class="gold-badge">S O P H E P</div><br>
        <div class="pill">/ APPLICATION RECEIVED</div>
        <div class="track-title">${safeTrackLabel} ${eventYear}</div>
        <div class="track-sub">Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), Topi, KP, Pakistan</div>
      </div>

      <div class="voucher-content">
        <div class="intro-block">
          <h2>Welcome, ${safeApplicantName}</h2>
          <p>Your registration for <strong>${safeTrackShort}</strong> has been logged in our secure registry. Present this voucher at the registration desk on arrival.</p>
        </div>

        <div class="qr-pass-box">
          <div class="qr-info">
            <div class="qr-badge">YOUR CHECK-IN QR TICKET</div>
            <div class="qr-ref">${safeReferenceId}</div>
            <div class="qr-notice">Present this QR pass and official photo ID (CNIC / Student Card) at GIKI Campus.</div>
          </div>
          <div class="qr-visual">
            <div class="qr-svg">${qrSvg}</div>
            <div class="qr-label">CHECK-IN PASS</div>
          </div>
        </div>

        <div class="dossier-card">
          <div class="dossier-card-header">
            <span class="dossier-title">OFFICIAL APPLICATION DOSSIER</span>
            <span class="status-pill">Under Review</span>
          </div>
          <table class="dossier-table">
            <tr><th>Reference ID</th><td style="font-family: monospace; font-weight: 800; color: #4f46e5;">${safeReferenceId}</td></tr>
            <tr><th>Event Track</th><td><strong>${safeTrackShort} (${safeTrackLabel})</strong></td></tr>
            <tr><th>${isMoot ? 'Team / Candidate' : 'Candidate / Delegation'}</th><td><strong>${safeApplicantName}</strong></td></tr>
            <tr><th>Institution</th><td>${safeInstitution}</td></tr>
            <tr><th>Contact Details</th><td style="font-family: monospace;">${safeEmail} · ${safePhone}</td></tr>
            <tr><th>Category / Size</th><td>${safeTypeLabel}</td></tr>
            <tr><th>Preferences / Roster</th><td>${safeSummary}</td></tr>
            <tr><th>Registration Fee</th><td><strong>${safeFeeDisplay}</strong> <span style="color: #64748b; font-size: 9px;">(Zero online billing; university bank invoice will follow)</span></td></tr>
            <tr><th>Logged Timestamp</th><td style="font-family: monospace; font-size: 9.5px; color: #475569;">${safeFormattedDate}</td></tr>
          </table>
        </div>

        <div class="event-card">
          <div class="event-card-title">Event Schedule &amp; Venue Details (${safeTrackShort} ${eventYear})</div>
          <div><strong>Event Dates:</strong> ${safeEventDates} &nbsp;·&nbsp; <strong>Venue:</strong> ${safeVenueTitle}</div>
          <div><strong>Registration Desk:</strong> Opens at <strong>09:00 AM PKT on Day 1</strong> in Main Auditorium Foyer. Bring original student ID, CNIC/B-Form, and this physical voucher.</div>
        </div>

        <div class="notice-box">
          <strong>Notice to Delegate/Team:</strong> Dossier is under review by the Secretariat and Bench Committee. Official university bank account invoice will follow by email. Retain reference code <strong>${safeReferenceId}</strong> for all correspondence.
        </div>

        <div class="signatures-block">
          <div class="sign-col">
            <div class="sign-line"></div>
            <strong>Applicant / Head Delegate Signature</strong><br>
            <span>Date: ___________________________</span>
          </div>
          <div class="sign-col" style="text-align: right;">
            <div class="sign-line"></div>
            <strong>GIKI Organizing Committee Registrar Seal</strong><br>
            <span style="font-family: monospace;">Verification Code: ${safeReferenceId}</span>
          </div>
        </div>

        <div class="footer-stamp">
          Official Conference Admission Voucher · SOPHEP — GIK Institute of Engineering Sciences and Technology · Topi, KP, Pakistan
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleDownloadHtml = () => {
    if (typeof window === 'undefined') return;
    const safeFileReference = referenceId.replace(/[^A-Za-z0-9_-]/g, '_');
    const htmlContent = generateVoucherDocumentHtml(false);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOPHEP_Voucher_${safeFileReference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-none print:w-full"
    >
      {/* Action Toolbar (Screen Only) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
            Dossier Successfully Logged
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Print or Save as PDF (Guaranteed 1-Page A4)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Download offline receipt voucher"
          >
            <Download className="w-3.5 h-3.5 text-neutral-gray" />
            <span>Download Voucher</span>
          </button>
        </div>
      </div>

      {/* Main Official Document Container */}
      <div
        id="sophep-registration-voucher"
        className="voucher-container rounded-2xl bg-white border border-slate-300 shadow-lg overflow-hidden print:border-2 print:border-slate-900 print:shadow-none print:rounded-none print:w-full print:m-0"
      >
        {/* Dark Branded Header (Matching Reference Design) */}
        <div
          className="voucher-dark-header bg-slate-950 px-6 py-7 text-center text-white relative overflow-hidden border-b border-slate-800 print:bg-slate-950 print:py-4 print:px-6 print:border-b-2 print:border-amber-400"
          style={{ backgroundColor: '#0b0f19', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <div className="relative z-10 space-y-2.5 print:space-y-1.5">
            {/* Golden SOPHEP Badge */}
            <div
              className="voucher-gold-badge inline-block bg-amber-400 text-slate-950 font-black text-sm tracking-[5px] px-5 py-1.5 rounded-sm uppercase shadow-sm print:text-xs print:px-3 print:py-1"
              style={{ backgroundColor: '#fbbf24', color: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              SOPHEP
            </div>

            <div>
              <span
                className="voucher-pill inline-block bg-white/10 border border-white/20 text-indigo-200 text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase print:text-[9px] print:py-0.5"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                / APPLICATION RECEIVED
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              <h1
                className="text-lg md:text-xl font-heading font-extrabold tracking-tight text-white uppercase print:text-base"
                style={{ color: '#ffffff' }}
              >
                {trackLabel} {eventYear}
              </h1>
              <p
                className="text-xs text-slate-400 font-serif max-w-xl mx-auto print:text-[10px]"
                style={{ color: '#94a3b8' }}
              >
                Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI), Topi, KP, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="voucher-content p-6 md:p-8 space-y-5 print:p-4 print:space-y-3">
          {/* Welcome Intro */}
          <div className="space-y-1 text-left border-b border-slate-100 pb-4 print:pb-2 print:space-y-0.5">
            <h2 className="text-lg md:text-xl font-heading font-extrabold text-slate-900 print:text-base">
              Welcome, {applicantName}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed print:text-[11px] print:leading-snug">
              Your registration for <strong className="text-slate-900">{trackNameShort}</strong> has been successfully
              submitted. Our administration team is reviewing your application dossier and verifying your credentials.
            </p>
          </div>

          {/* Reference ID & QR Ticket Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:p-3 print:my-1 print:gap-3 print:bg-white print:border-slate-300">
            <div className="space-y-1.5 print:space-y-1 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full print:bg-indigo-50 print:text-indigo-900">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Your Check-In QR Ticket</span>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Official Reference Code</div>
                <div className="text-xl md:text-2xl font-mono font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2 print:text-lg">
                  <span>{referenceId}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-slate-200 text-indigo-600 transition-colors print:hidden cursor-pointer"
                    title="Copy reference"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm print:text-[10px]">
                Present this QR code and reference ID at the registration desk on arrival at GIKI Campus.
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="shrink-0 bg-white p-2.5 rounded-xl border border-slate-300 shadow-xs text-center flex flex-col items-center justify-center w-28 print:border-slate-800 print:shadow-none">
              {qrSvg ? (
                <div
                  className="w-20 h-20 mx-auto flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block print:w-16 print:h-16"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-[10px] font-mono text-slate-400 print:w-16 print:h-16">
                  QR TICKET
                </div>
              )}
              <span className="text-[9px] font-mono font-bold text-slate-700 block mt-1 tracking-wider uppercase">CHECK-IN PASS</span>
            </div>
          </div>

          {/* Official Application Dossier Summary */}
          <div className="rounded-xl border border-slate-300 overflow-hidden text-left text-xs bg-white shadow-xs print:text-[10px] print:my-1 print:border-slate-300">
            <div className="bg-slate-950 px-4 py-2.5 font-mono text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between print:bg-slate-950 print:text-white">
              <span>Official Application Dossier</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide">
                Under Review
              </span>
            </div>
            <dl className="divide-y divide-slate-100 text-slate-900">
              <div className="grid grid-cols-3 px-4 py-2 bg-white items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Reference ID</dt>
                <dd className="col-span-2 text-indigo-700 font-mono font-bold">{referenceId}</dd>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-slate-50/70 items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Event Track</dt>
                <dd className="col-span-2 text-slate-900 font-bold">{trackNameShort} ({trackLabel})</dd>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-white items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">{isMoot ? 'Team / Candidate' : 'Candidate / Delegation'}</dt>
                <dd className="col-span-2 text-slate-900 font-semibold">{applicantName}</dd>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-slate-50/70 items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Category / Size</dt>
                <dd className="col-span-2 text-slate-900 font-semibold">{typeLabel}</dd>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-white items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Institution</dt>
                <dd className="col-span-2 text-slate-900">{details?.institution || 'Not specified'}</dd>
              </div>
              {details?.email && (
                <div className="grid grid-cols-3 px-4 py-2 bg-slate-50/70 items-center">
                  <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Contact Details</dt>
                  <dd className="col-span-2 text-slate-900 font-mono text-[11px]">{details.email}{details?.phone ? ` · ${details.phone}` : ''}</dd>
                </div>
              )}
              {details?.summary && (
                <div className="grid grid-cols-3 px-4 py-2 bg-white items-center">
                  <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Preferences / Roster</dt>
                  <dd className="col-span-2 text-slate-900">{details.summary}</dd>
                </div>
              )}
              <div className="grid grid-cols-3 px-4 py-2 bg-slate-50/70 items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Registration Fee</dt>
                <dd className="col-span-2 text-slate-900 font-bold">
                  {feeDisplay} <span className="text-slate-500 font-normal text-[11px]">(Zero online billing; university bank invoice will follow)</span>
                </dd>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-white items-center">
                <dt className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Logged Timestamp</dt>
                <dd className="col-span-2 text-slate-600 font-mono text-[11px]">{formattedDate}</dd>
              </div>
            </dl>
          </div>

          {/* Event Details Card */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-left space-y-2 print:p-3 print:my-1 print:bg-white print:border-amber-400">
            <div className="flex items-center gap-2 text-amber-950 font-heading font-bold text-xs uppercase tracking-wider print:text-[11px]">
              <Calendar className="w-4 h-4 text-amber-600 print:w-3.5 print:h-3.5" />
              <span>Event Information &amp; Schedule ({trackNameShort} {eventYear})</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs print:text-[10px] print:gap-1.5">
              <div>
                <span className="text-slate-500 font-medium">Dates: </span>
                <span className="font-bold text-slate-900">{eventDates}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Venue: </span>
                <span className="font-semibold text-slate-900">{venueTitle}</span>
              </div>
              <div className="sm:col-span-2 pt-1 border-t border-amber-200/60 print:pt-0.5">
                <span className="text-slate-500 font-medium">Arrival Desk: </span>
                <span className="text-slate-700">Opens <strong>09:00 AM PKT on Day 1</strong> in Main Auditorium Foyer. Bring original student ID, CNIC/B-Form, and this printed voucher.</span>
              </div>
            </div>
          </div>

          {/* Screen Only: Payment Policy & Next Steps */}
          <div className="space-y-4 print:hidden">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block">Payment Notice: Zero Online Charge</span>
                <span>
                  You have not been billed online. The Organizing Committee will dispatch an official university bank
                  invoice to <strong>{details?.email || 'your email'}</strong> after dossier review. Please retain your
                  reference code <strong>{referenceId}</strong> for payment tracking.
                </span>
              </div>
            </div>

            <div className="space-y-3 text-left pt-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                What Happens Next
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">1</span>
                    <span>Dossier Review</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Secretariat evaluates allocations and rosters within 2–3 business days.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">2</span>
                    <span>Official Invoice</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Official university bank account details and fee invoice emailed for verification.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span>
                    <span>Seat Confirmation</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Payment slip verified by Finance; official Country Matrix allocation or Team Code confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Only: Registrar Verification and Signatures */}
          <div className="hidden print:block pt-3 border-t-2 border-slate-300 text-xs text-slate-700 space-y-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 leading-snug">
              <strong>Notice to Delegate/Team:</strong> This electronic voucher is under active verification. Official university bank payment invoice will follow via email. Present this physical voucher with your original student ID and CNIC/B-Form at the GIKI Main Auditorium registration desk.
            </div>

            <div className="grid grid-cols-2 gap-8 pt-1 text-left">
              <div>
                <div className="h-10 border-b-2 border-dashed border-slate-400 mb-1" />
                <span className="font-mono uppercase font-bold text-[9px] text-slate-800 block">
                  Applicant / Head Delegate Signature
                </span>
                <span className="text-[9px] text-slate-500">Date: ___________________________</span>
              </div>
              <div className="text-right">
                <div className="h-10 border-b-2 border-dashed border-slate-400 mb-1" />
                <span className="font-mono uppercase font-bold text-[9px] text-slate-800 block">
                  GIKI Organizing Committee Registrar Seal
                </span>
                <span className="text-[9px] text-slate-600 font-mono">Verification Code: {referenceId}</span>
              </div>
            </div>

            <p className="text-[8px] text-center text-slate-400 font-mono pt-1">
              Official Conference Admission Voucher · SOPHEP — Ghulam Ishaq Khan Institute of Engineering Sciences and Technology
            </p>
          </div>
        </div>

        {/* Footer Actions (Screen Only) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2 underline cursor-pointer"
              >
                Submit another application
              </button>
            )}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors shadow-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
