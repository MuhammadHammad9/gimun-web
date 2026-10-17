import { findCertificate } from '@/lib/server/certificates';
import { certificatePdf } from '@/lib/server/certificate-pdf';
import { clientIp, enforceRateLimit } from '@/lib/server/submissions';
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  // Each download builds a PDF and embeds a font; limit it like a form submission.
  if(!(await enforceRateLimit('certificate-pdf',clientIp(request))).allowed)return new Response('Too many downloads. Try again in a few minutes.',{status:429,headers:{'Retry-After':'600'}});
  const {code}=await params;
  let certificate;
  // An outage is not "not found": say it is temporary, so a genuine certificate is never doubted.
  try{certificate=await findCertificate(code);}
  catch{return new Response('Certificate downloads are temporarily unavailable. Please try again shortly.',{status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}});}
  if(!certificate)return new Response('Not found',{status:404});
  if(certificate.revoked)return new Response('This certificate has been revoked and is no longer valid.',{status:410,headers:{'Cache-Control':'no-store'}});
  // Revalidated on each download: a revoked certificate must stop downloading at once.
  try {return new Response(await certificatePdf(certificate),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${certificate.serial.replace(/[^A-Za-z0-9._-]/g,'_')}.pdf"`,'Cache-Control':'private, no-cache'}});}
  catch{return new Response('PDF unavailable. Verify the certificate online; ask the organizer to check the configured URL and font support.',{status:422});}
}
