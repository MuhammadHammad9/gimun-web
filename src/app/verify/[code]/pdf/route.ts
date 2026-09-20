import { findCertificate } from '@/lib/server/certificates';
import { certificatePdf } from '@/lib/server/certificate-pdf';
export async function GET(_request:Request,{params}:{params:Promise<{code:string}>}){
  const {code}=await params;const certificate=await findCertificate(code);if(!certificate)return new Response('Not found',{status:404});
  try {return new Response(await certificatePdf(certificate),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${certificate.serial}.pdf"`,'Cache-Control':'private, no-store'}});}
  catch{return new Response('PDF unavailable. Verify the certificate online; ask the organizer to check the configured URL and font support.',{status:422});}
}
