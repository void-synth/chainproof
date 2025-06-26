-- Create piracy_scans table
create table if not exists public.piracy_scans (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    scan_id text unique not null,
    overall_risk text not null check (overall_risk in ('low', 'medium', 'high', 'critical')),
    confidence_score integer not null check (confidence_score >= 0 and confidence_score <= 100),
    matches_count integer not null default 0,
    scan_summary text not null,
    scan_details jsonb not null default '{}',
    matches jsonb not null default '[]',
    recommendations jsonb not null default '[]',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index if not exists piracy_scans_user_id_idx on public.piracy_scans(user_id);
create index if not exists piracy_scans_scan_id_idx on public.piracy_scans(scan_id);
create index if not exists piracy_scans_overall_risk_idx on public.piracy_scans(overall_risk);
create index if not exists piracy_scans_created_at_idx on public.piracy_scans(created_at desc);

-- Enable RLS
alter table public.piracy_scans enable row level security;

-- Create RLS policies
create policy "Users can view their own piracy scans"
    on public.piracy_scans for select
    using (auth.uid() = user_id);

create policy "Users can insert their own piracy scans"
    on public.piracy_scans for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own piracy scans"
    on public.piracy_scans for update
    using (auth.uid() = user_id);

create policy "Users can delete their own piracy scans"
    on public.piracy_scans for delete
    using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on public.piracy_scans to postgres, service_role;
grant select, insert, update, delete on public.piracy_scans to authenticated;
