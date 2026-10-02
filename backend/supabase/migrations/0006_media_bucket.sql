insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,26214400,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- Uploads use service-minted signed URLs. Do not add anon/authenticated write policies.
