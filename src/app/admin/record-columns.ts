export const recordColumns:Record<string,string[]>={
 registrations:['reference_id','applicant_name','institution','track','status','payment_status','amount_due','amount_paid','submitted_at'],
 inbox:['id','name','email','kind','message','handled_status','created_at'],
 email:['id','message_type','to_addresses','subject','status','attempts','created_at','sent_at'],
 'event-day':['id','registration_ref','name','role','checked_in_at'],
 allocations:['participant_id','committee_slug','country'],
 certificates:['id','participant_id','kind','serial','issued_at','verify_code'],
 feedback:['id','label','kind','active','sort_order'],
 'close-out':['id','name','created_at'],users:['user_id','display_name','email','role','active','sections','created_at'],
 media:['id','alt','mime','size','state','created_at'],audit:['id','action','section','entity_id','created_at']};
export const sectionHelp:Record<string,string>={registrations:'Review applications, confirm payment and correct participant details.',inbox:'Read inquiries, assign follow-up and reply to senders.',email:'Monitor queued messages and provider acceptance. Sent means accepted by the provider, not confirmed inbox delivery.','event-day':'Scan a ticket or look up a registration, then confirm each participant’s arrival.',allocations:'Assign accepted delegates to available countries. Reservations hold a country without assigning a delegate.',certificates:'Issue certificates to eligible participants and track their public verification links.',feedback:'Manage survey questions and review responses. Historical responses retain their original question wording.',media:'Upload and reuse images and documents. Referenced files are protected from deletion.',users:'Manage staff access. Permissions apply to every page and action.',audit:'Review recorded changes and exports. Technical identifiers are retained here for investigation.','close-out':'Create an archive snapshot and close registration. A snapshot preserves content; it does not lock later edits.'};
