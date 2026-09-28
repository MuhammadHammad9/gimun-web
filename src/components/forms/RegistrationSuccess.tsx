'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Printer,
  Download,
  ArrowLeft,
} from 'lucide-react';
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
    checkinToken?: string;
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

  const site = useSiteConfig();
  const isMoot = track === 'moot-cup';
  const trackLabel = isMoot ? 'GIKI Moot Court (GMC)' : 'GIKI Model United Nations (GIMUN)';
  const trackNameShort = isMoot ? 'GMC' : 'GIMUN';
  const typeLabel =
    applicantType === 'individual'
      ? 'Individual entry'
      : applicantType === 'delegation'
      ? `Entering as a delegation (${details?.participantCount || 1} Delegates)`
      : `Advocacy Team (${details?.participantCount || 3} Advocates)`;

  const feeDisplay =
    details?.feeAmount ||
    (isMoot ? site.fees.mootCupTeam : applicantType === 'individual' ? site.fees.gimunIndividual : site.fees.gimunDelegationPerDelegate);

  const eventDates = details?.eventDates || getCanonicalEventDateRange(site);
  const venueTitle = details?.venue || getCanonicalVenue(site);
  const eventYear = getEventYear(site);
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
      const qrReference = details?.checkinToken || referenceId;
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
  }, [referenceId, details?.checkinToken]);

  const handleCopy = async () => {
    if (!referenceId || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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
      iframe.title = `GIMUN_Voucher_${referenceId}`;
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
  <title>GIMUN_Voucher_${safeReferenceId}</title>
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
      <span>OFFICIAL GIMUN DIGITAL CREDENTIAL · VERIFIED DOSSIER</span>
    </div>
    <div class="top-bar-actions">
      <button class="btn-copy" onclick="navigator.clipboard.writeText('${safeReferenceId}'); this.innerText='Copied'; setTimeout(()=>this.innerText='Copy reference', 2000);">
        Copy reference
      </button>
      <button class="btn-print" onclick="window.print()">
        Print or save as PDF
      </button>
    </div>
  </div>
  `
  }

  <div class="page-wrap">
    <div class="voucher-card">
      <div class="dark-header">
        <div class="gold-badge">G I M U N & G M C</div><br>
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
          <div><strong>Registration Desk:</strong> ${escapeHtml(site.checkinDesk || 'Check-in details will be announced.')} ${escapeHtml(site.entryRequirement || '')}</div>
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
          Official Conference Admission Voucher · GIMUN — GIK Institute of Engineering Sciences and Technology · Topi, KP, Pakistan
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
    a.download = `GIMUN_Voucher_${safeFileReference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // On screen the confirmation uses the site's own design. The printable and
  // downloadable voucher (generateVoucherDocumentHtml) stays a white document
  // because that is what prints and archives well.
  const summaryRows: { term: string; value: React.ReactNode }[] = [
    { term: 'Track', value: trackLabel },
    { term: isMoot ? 'Team' : 'Applicant', value: applicantName },
    { term: 'Entry', value: typeLabel },
    { term: 'Institution', value: details?.institution || 'Not specified' },
    ...(details?.email ? [{ term: 'Contact', value: `${details.email}${details.phone ? ` · ${details.phone}` : ''}` }] : []),
    ...(details?.summary ? [{ term: isMoot ? 'Category' : 'Preferences', value: details.summary }] : []),
    { term: 'Fee', value: feeDisplay },
    { term: 'Event', value: `${eventDates} · ${venueTitle}` },
    { term: 'Submitted', value: formattedDate },
  ];
  const nextSteps = [
    { title: 'Review', body: site.replyTime || 'The organizing team reviews your application and follows up by email.' },
    { title: 'Invoice', body: `If you are accepted, an invoice with bank transfer details is emailed to ${details?.email || 'you'}.` },
    { title: 'Confirmation', body: isMoot ? 'Once payment is verified, your team code and round schedule are confirmed.' : 'Once payment is verified, your committee and country allocation are confirmed.' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="double-bezel">
        <div className="double-bezel-inner overflow-hidden">
          {/* Confirmation header */}
          <div className="grid gap-8 border-b border-line p-8 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-champagne/5 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-champagne">
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                Application received
              </p>
              <h2 className="mt-5 text-h2 font-display font-medium text-balance text-text">
                Thank you, {applicantName.split(' (')[0]}.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-3">
                Your {trackNameShort} {eventYear} application is with the organizing team. A copy of this receipt and your
                QR ticket are on their way to {details?.email || 'your email'}. Nothing has been charged.
              </p>

              <div className="mt-7">
                <p className="text-xs text-text-4">Reference number</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-mono text-2xl font-semibold tracking-tight text-text sm:text-3xl">{referenceId}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Reference copied' : 'Copy reference number'}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-2 text-text-3 transition-colors hover:border-line-3 hover:text-text"
                  >
                    {copied ? <Check aria-hidden="true" className="h-4 w-4 text-champagne" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-4">Quote it in every message and as your payment reference.</p>
              </div>
            </div>

            {/* The QR stays dark-on-white so any phone camera can read it. */}
            <figure className="mx-auto w-40 text-center md:mx-0">
              <div className="rounded-2xl bg-white p-3">
                {qrSvg ? (
                  <div
                    className="mx-auto aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    role="img"
                    aria-label={`Check-in QR code for ${referenceId}`}
                  />
                ) : (
                  <div className="aspect-square w-full animate-pulse rounded-lg bg-slate-100" />
                )}
              </div>
              <figcaption className="mt-2 text-xs text-text-4">Check-in ticket</figcaption>
            </figure>
          </div>

          {/* What was submitted */}
          <div className="p-8 sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-4">Your application</p>
            <dl className="mt-4 border-b border-line">
              {summaryRows.map((row) => (
                <div key={row.term} className="grid gap-1 border-t border-line py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="text-sm text-text-4">{row.term}</dt>
                  <dd className="text-sm leading-relaxed text-text-2">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-champagne px-5 text-sm font-semibold text-canvas transition-colors hover:bg-champagne-hi"
              >
                <Printer aria-hidden="true" className="h-4 w-4" />
                Print or save as PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm font-medium text-text transition-colors hover:border-line-3 hover:bg-champagne/5"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <section aria-labelledby="next-heading" className="px-1">
        <h3 id="next-heading" className="text-xl font-display font-medium text-text">
          What happens next
        </h3>
        <ol className="mt-6 grid gap-8 md:grid-cols-3">
          {nextSteps.map((step, i) => (
            <li key={step.title} className="relative border-t border-line pt-5">
              <span aria-hidden="true" className="absolute -top-px left-0 h-px w-10 bg-champagne" />
              <span className="font-mono text-xs text-champagne tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 font-display font-medium text-text">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-text-3">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-1 pt-6">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-text-3 underline underline-offset-4 transition-colors hover:text-text"
          >
            Submit another application
          </button>
        ) : (
          <span />
        )}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-champagne transition-colors hover:text-text">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
