-- Create profiles table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    full_name text,
    company text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create content table
create table content (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    organization_id uuid references organizations(id) on delete set null,
    title text not null,
    description text,
    type text not null,
    category text,
    tags text[] default '{}',
    storage_path text,
    status text default 'draft' not null,
    visibility text default 'private' not null,
    protection_score integer default 0,
    access_count integer default 0,
    last_accessed timestamp with time zone,
    metadata jsonb default '{}'::jsonb,
    sharing_settings jsonb default '{
        "allowed_domains": [],
        "allowed_emails": [],
        "download_enabled": false,
        "watermark_enabled": true
    }'::jsonb,
    blockchain_hash text,
    ipfs_hash text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create content versions table
create table content_versions (
    id uuid default gen_random_uuid() primary key,
    content_id uuid references content(id) on delete cascade not null,
    version integer not null,
    changes text,
    metadata jsonb default '{}'::jsonb,
    blockchain_verification jsonb,
    ipfs_details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    type text not null,
    title text not null,
    message text not null,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user settings table
create table user_settings (
    user_id uuid references auth.users on delete cascade primary key,
    email_notifications boolean default true,
    auto_protection boolean default false,
    two_factor_auth boolean default false,
    api_key text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organizations table
create table organizations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    domain text,
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organization members table
create table organization_members (
    organization_id uuid references organizations(id) on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (organization_id, user_id)
);

-- Create content access logs table
create table content_access_logs (
    id uuid default gen_random_uuid() primary key,
    content_id uuid references content(id) on delete cascade not null,
    user_id uuid references auth.users on delete set null,
    ip_address text,
    user_agent text,
    access_type text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table content enable row level security;
alter table content_versions enable row level security;
alter table notifications enable row level security;
alter table user_settings enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table content_access_logs enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = id);

-- Content policies
create policy "Users can view their own content"
    on content for select
    using (auth.uid() = user_id);

create policy "Users can view organization content"
    on content for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = content.organization_id
            and organization_members.user_id = auth.uid()
        )
    );

create policy "Users can view public content"
    on content for select
    using (visibility = 'public');

create policy "Users can view content shared with their domain"
    on content for select
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.email like '%' || any(sharing_settings->>'allowed_domains')
        )
    );

create policy "Users can view content shared with their email"
    on content for select
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.email = any(sharing_settings->>'allowed_emails')
        )
    );

create policy "Users can insert their own content"
    on content for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own content"
    on content for update
    using (auth.uid() = user_id);

create policy "Users can delete their own content"
    on content for delete
    using (auth.uid() = user_id);

-- Content versions policies
create policy "Users can view versions of content they can access"
    on content_versions for select
    using (
        exists (
            select 1 from content
            where content.id = content_versions.content_id
            and (
                content.user_id = auth.uid()
                or content.visibility = 'public'
                or (
                    exists (
                        select 1 from organization_members
                        where organization_members.organization_id = content.organization_id
                        and organization_members.user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Notifications policies
create policy "Users can view their own notifications"
    on notifications for select
    using (auth.uid() = user_id);

create policy "Users can update their own notifications"
    on notifications for update
    using (auth.uid() = user_id);

-- User settings policies
create policy "Users can view their own settings"
    on user_settings for select
    using (auth.uid() = user_id);

create policy "Users can update their own settings"
    on user_settings for update
    using (auth.uid() = user_id);

-- Organizations policies
create policy "Users can view organizations they are members of"
    on organizations for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = organizations.id
            and organization_members.user_id = auth.uid()
        )
    );

-- Organization members policies
create policy "Users can view organization members"
    on organization_members for select
    using (
        exists (
            select 1 from organization_members as om
            where om.organization_id = organization_members.organization_id
            and om.user_id = auth.uid()
        )
    );

-- Content access logs policies
create policy "Users can view access logs for their content"
    on content_access_logs for select
    using (
        exists (
            select 1 from content
            where content.id = content_access_logs.content_id
            and content.user_id = auth.uid()
        )
    );

-- Create functions and triggers
create or replace function increment_content_access_count()
returns trigger as $$
begin
    update content
    set 
        access_count = access_count + 1,
        last_accessed = now()
    where id = new.content_id;
    return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger on_content_access
    after insert on content_access_logs
    for each row
    execute function increment_content_access_count();

-- Indexes
create index idx_content_user_id on content(user_id);
create index idx_content_organization_id on content(organization_id);
create index idx_content_visibility on content(visibility);
create index idx_content_type on content(type);
create index idx_content_status on content(status);
create index idx_content_created_at on content(created_at);
create index idx_content_access_logs_content_id on content_access_logs(content_id);
create index idx_content_access_logs_created_at on content_access_logs(created_at);
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_created_at on notifications(created_at);
create index idx_organization_members_user_id on organization_members(user_id);
create index idx_content_versions_content_id on content_versions(content_id); 