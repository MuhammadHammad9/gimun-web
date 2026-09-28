import { findCertificate } from '@/lib/server/certificates';
import { certificatePdf } from '@/lib/server/certificate-pdf';
import { clientIp, enforceRateLimit, SubmissionServiceError } from '@/lib/server/submissions';
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  // Each download builds a PDF and embeds a font; limit it like a form submission.
  try{if(!(await enforceRateLimit('certificate-pdf',clientIp(request))).allowed)return new Response('Too many downloads. Try again in a few minutes.',{status:429,headers:{'Retry-After':'600'}});}
  catch(error){if(error instanceof SubmissionServiceError)return new Response('Downloads are temporarily unavailable.',{status:503});throw error;}
  const {code}=await params;const certificate=await findCertificate(code);if(!certificate)return new Response('Not found',{status:404});
  // Certificates never change once issued, so browsers may keep their copy for a day.
  try {return new Response(await certificatePdf(certificate),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${certificate.serial}.pdf"`,'Cache-Control':'private, max-age=86400'}});}
  catch{return new Response('PDF unavailable. Verify the certificate online; ask the organizer to check the configured URL and font support.',{status:422});}
}
