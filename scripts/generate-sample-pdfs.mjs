import fs from 'fs';
import path from 'path';

const documents = [
  {
    path: 'public/documents/shared/GIMUN_MootCup_Handbook_2027.pdf',
    title: 'GIMUN & GIKI Moot Cup — Delegate & Participant Handbook',
    subtitle: 'Official Logistics, Code of Conduct & Conference Policies',
  },
  {
    path: 'public/documents/shared/GIKI_Campus_Map_Venue_Guide.pdf',
    title: 'GIKI Campus Map & Venue Logistics Dossier',
    subtitle: 'Auditorium, Committee Rooms, Courtrooms & Guest House Coordinates',
  },
  {
    path: 'public/documents/gimun/UNSC_Background_Guide_2027.pdf',
    title: 'UN Security Council (UNSC) Background Guide',
    subtitle: 'Topic: Securing International Maritime Corridors Against Non-State Actors',
  },
  {
    path: 'public/documents/gimun/UNHRC_Background_Guide_2027.pdf',
    title: 'UN Human Rights Council (UNHRC) Background Guide',
    subtitle: 'Topic: Algorithmic Surveillance, Border Control, and Civil Liberties',
  },
  {
    path: 'public/documents/gimun/DISEC_Background_Guide_2027.pdf',
    title: 'Disarmament & International Security (DISEC) Background Guide',
    subtitle: 'Topic: Proliferation of Autonomous Weapons Systems',
  },
  {
    path: 'public/documents/gimun/GIMUN_Rules_of_Procedure.pdf',
    title: 'GIMUN Official Parliamentary Rules of Procedure (RoP)',
    subtitle: 'Points, Motions, Moderated & Unmoderated Caucus Regulations',
  },
  {
    path: 'public/documents/moot-cup/GIKI_Moot_Cup_2027_Proposition.pdf',
    title: 'GIKI Moot Cup Official Compromis & Statement of Agreed Facts',
    subtitle: 'Federal Republic of Alvernia v. Kingdom of Zephyria (ICJ)',
  },
  {
    path: 'public/documents/moot-cup/Moot_Cup_Rules_and_Memorial_Guide.pdf',
    title: 'GIKI Moot Cup Competition Rules & Memorial Drafting Handbook',
    subtitle: 'Appellate Advocacy Standards, Word Counts, Citation & Scoring Rubric',
  },
];

function createMinimalPdf(title, subtitle) {
  const content = `BT
/F1 18 Tf
50 720 Td
(${title.replace(/[\(\)]/g, '')}) Tj
ET
BT
/F1 11 Tf
50 690 Td
(${subtitle.replace(/[\(\)]/g, '')}) Tj
ET
BT
/F1 10 Tf
50 640 Td
(Official Conference Document published by Ghulam Ishaq Khan Institute GIKI.) Tj
ET
BT
/F1 10 Tf
50 620 Td
(Society for the Promotion of Higher Education in Pakistan SOPHEP.) Tj
ET
BT
/F1 9 Tf
50 580 Td
(This is an official verification document for GIMUN & GIKI Moot Cup.) Tj
ET`;

  const streamLength = Buffer.byteLength(content);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000${(234 + 40 + streamLength).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${350 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

for (const doc of documents) {
  const fullPath = path.resolve(process.cwd(), doc.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const pdfBuffer = createMinimalPdf(doc.title, doc.subtitle);
  fs.writeFileSync(fullPath, pdfBuffer);
  console.log(`Generated: ${doc.path} (${pdfBuffer.length} bytes)`);
}

console.log('All sample documents generated successfully.');
