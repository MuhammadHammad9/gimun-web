import { notFound } from 'next/navigation';
import { findCertificate } from '@/lib/server/certificates';
export const dynamic='force-dynamic';
export const metadata={title:'Certificate verification',robots:{index:false,follow:false}};
export default async function VerifyPage({params}:{params:Promise<{code:string}>}){const {code}=await params;const certificate=await findCertificate(code);if(!certificate)notFound();return <section className="max-w-2xl mx-auto p-8 sm:p-16 space-y-4"><h1 className="text-3xl">Verified certificate</h1><p className="text-2xl">{certificate.name}</p><p>Certificate of {certificate.kind}</p><p>Serial: {certificate.serial}</p><p>Issued: {new Date(certificate.issuedAt).toISOString().slice(0,10)}</p><a className="underline" href={`/verify/${code}/pdf`}>Download certificate PDF</a></section>;}
