import { findCertificate } from '@backend/server/certificates';
import { certificatePdf } from '@backend/server/certificate-pdf';
import { clientIp, enforceRateLimit } from '@backend/server/submissions';
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  // Each download builds a PDF and embeds a font; limit it like a form submission.
  if(!(await enforceRateLimit('certificate-pdf',clientIp(request))).allowed)return new Response('Too many downloads. Try again in a few minutes.',{status:429,headers:{'Retry-After':'600'}});
  const {code}=await params;
  let certificate;
  // An outage is not "not found": say it is temporary, so a genuine certificate is never doubted.
  try{certificate=await findCertificate(code);}
  catch{return new Response('Certificate downloads are temporarily unavailable. Please try again shortly.',{status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}});}
  if(!certificate)return new Response('Not found',{status:404});
  // Certificates never change once issued, so browsers may keep their copy for a day.
  try {return new Response(await certificatePdf(certificate),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${certificate.serial.replace(/[^A-Za-z0-9._-]/g,'_')}.pdf"`,'Cache-Control':'private, max-age=86400'}});}
  catch{return new Response('PDF unavailable. Verify the certificate online; ask the organizer to check the configured URL and font support.',{status:422});}
}
