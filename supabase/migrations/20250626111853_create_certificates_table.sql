-- Create certificates table
create table if not exists public.certificates (
    id uuid default gen_random_uuid() primary key,
    certificate_id text unique not null,
    user_id uuid references auth.users(id) on delete cascade,
    
    -- Certificate core data
    owner_name text not null,
    asset_title text not null,
    content_hash text not null,
    protection_date timestamp with time zone not null,
    
    -- Blockchain verification data
    blockchain_hash text,
    blockchain_network text,
    blockchain_timestamp timestamp with time zone,
    
    -- IPFS data
    ipfs_hash text,
    ipfs_url text,
    ipfs_uri text,
    
    -- Asset metadata
    asset_type text,
    file_size bigint,
    protection_score integer check (protection_score >= 0 and protection_score <= 100),
    
    -- Certificate file storage
    download_url text not null,
    pdf_size bigint,
    
    -- Verification data
    verification_count integer default 0,
    last_verified_at timestamp with time zone,
    
    -- Status and metadata
    status text default 'active' check (status in ('active', 'revoked', 'expired')),
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    revocation_reason text,
    
    -- Email delivery
    email_sent boolean default false,
    email_sent_at timestamp with time zone,
    recipient_email text,
    
    -- Timestamps
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create storage bucket for certificates if it doesn't exist
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Create indexes for performance
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists certificates_certificate_id_idx on public.certificates(certificate_id);
create index if not exists certificates_content_hash_idx on public.certificates(content_hash);
create index if not exists certificates_status_idx on public.certificates(status);
create index if not exists certificates_created_at_idx on public.certificates(created_at desc);
create index if not exists certificates_protection_date_idx on public.certificates(protection_date desc);

-- Enable RLS
alter table public.certificates enable row level security;

-- Create RLS policies
create policy "Users can view their own certificates"
    on public.certificates for select
    using (auth.uid() = user_id);

create policy "Users can insert their own certificates"
    on public.certificates for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own certificates"
    on public.certificates for update
    using (auth.uid() = user_id);

create policy "Users can delete their own certificates"
    on public.certificates for delete
    using (auth.uid() = user_id);

-- Public verification policy (anyone can verify certificates by ID)
create policy "Anyone can verify certificates by certificate_id"
    on public.certificates for select
    using (true)
    with check (false);

-- Storage policies for certificates bucket
create policy "Users can upload their own certificates"
    on storage.objects for insert
    with check (
        bucket_id = 'certificates' and
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can view their own certificates"
    on storage.objects for select
    using (
        bucket_id = 'certificates' and
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Public can view certificates" 
    on storage.objects for select
    using (bucket_id = 'certificates');

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_certificates_updated_at
    before update on public.certificates
    for each row
    execute function public.update_updated_at_column();

-- Create function to increment verification count
create or replace function public.increment_certificate_verification(cert_id text)
returns void as $$
begin
    update public.certificates 
    set 
        verification_count = verification_count + 1,
        last_verified_at = timezone('utc'::text, now())
    where certificate_id = cert_id;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.certificates to postgres, service_role;
grant select, insert, update, delete on public.certificates to authenticated;
grant execute on function public.increment_certificate_verification(text) to anon, authenticated;
