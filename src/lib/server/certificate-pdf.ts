import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument,rgb } from 'pdf-lib';
import { getSiteConfig } from '@/lib/content';
import { getServerConfig } from './config';
export type CertificateDocument={serial:string;kind:string;name:string;code:string;issuedAt:string};
export async function certificatePdf(certificate:CertificateDocument){
  const site=await getSiteConfig();const origin=getServerConfig().siteUrl;
  if(!origin)throw new Error('SITE_URL must be configured before issuing PDFs.');
  const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
  const font=await doc.embedFont(await readFile(path.join(process.cwd(),'src/assets/fonts/GeneralSans-Variable.woff2')),{subset:true});
  const supported=new Set(font.getCharacterSet());
  const page=doc.addPage([842,595]);
  page.drawRectangle({x:28,y:28,width:786,height:539,borderWidth:2,borderColor:rgb(.45,.25,.08)});
  const center=(text:string,y:number,size:number)=>{
    if([...text].some(c=>!supported.has(c.codePointAt(0)!)))throw new Error('The certificate font does not support this spelling. Use the verification page and request a suitable font template.');
    const fitted=Math.min(size,740/Math.max(1,font.widthOfTextAtSize(text,1)));
    page.drawText(text,{x:(842-font.widthOfTextAtSize(text,fitted))/2,y,size:fitted,font,color:rgb(.15,.12,.1)});
  };
  center(site.eventNames.combined,485,26);center(`Certificate of ${certificate.kind}`,415,32);center('Presented to',355,16);center(certificate.name,300,36);center(site.venue,225,15);center(`Issued ${certificate.issuedAt.slice(0,10)}`,170,12);center(certificate.serial,125,10);center(`Verify: ${new URL(`/verify/${certificate.code}`,origin)}`,92,10);
  return new Uint8Array(await doc.save());
}
