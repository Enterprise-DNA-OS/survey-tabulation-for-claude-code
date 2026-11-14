create table studies (
 id uuid primary key default gen_random_uuid(), name text not null unique check(length(trim(name))>0), owner text not null default '',
 purpose text not null default '', accuracy_review date, retention_review date, min_base integer not null default 5 check(min_base>=2),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table datasets (
 id uuid primary key default gen_random_uuid(), study_id uuid not null references studies(id), name text not null,
 source text not null, exported_at timestamptz not null, fingerprint text not null, mapping jsonb not null,
 revision integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(study_id,name)
);
create table variables (
 id uuid primary key default gen_random_uuid(), dataset_id uuid not null references datasets(id), name text not null,
 source_column text not null, kind text not null check(kind in ('categorical','numeric')), missing jsonb not null default '[""]',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(dataset_id,name)
);
create table cases (
 id uuid primary key default gen_random_uuid(), dataset_id uuid not null references datasets(id), source_id text not null,
 weight double precision not null check(weight>=0 and weight<=1000000000), answers jsonb not null, raw jsonb not null,
 excluded boolean not null default false, exclusion_reason text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(dataset_id,source_id)
);
create table analysis_runs (
 id uuid primary key default gen_random_uuid(), dataset_id uuid not null references datasets(id), revision integer not null,
 name text not null, specification jsonb not null, result jsonb not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), study_id uuid not null references studies(id), body text not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), action text not null, record_id uuid, actor text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function touch_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$$;
do $$declare n text; begin foreach n in array array['studies','datasets','variables','cases','analysis_runs','notes','audit_events'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',n);
 execute format('alter table %I enable row level security',n);
 execute format('revoke all on %I from public',n);
end loop; end$$;
create index cases_dataset on cases(dataset_id);
create view dataset_health as
 select d.id,d.study_id,s.name as study,d.name as dataset,d.source,d.exported_at,d.revision,
 count(c.id)::int as total_cases,count(c.id) filter(where c.excluded)::int as excluded_cases,
 count(c.id) filter(where not c.excluded and c.weight=0)::int as zero_weight_cases,
 count(c.id) filter(where not c.excluded and c.weight>0)::int as active_cases,
 coalesce(sum(c.weight) filter(where not c.excluded),0) as total_weight,
 round((power(sum(c.weight) filter(where not c.excluded),2)/nullif(sum(c.weight*c.weight) filter(where not c.excluded),0))::numeric,2) as effective_base
 from datasets d join studies s on s.id=d.study_id left join cases c on c.dataset_id=d.id group by d.id,s.name;
create view study_attention as
 select id,name as study,'owner_missing' as rule,'Assign the research owner' as action from studies where trim(owner)=''
 union all select id,name,'purpose_missing','Record why these responses are held' from studies where trim(purpose)=''
 union all select id,name,'accuracy_review_due','Review source quality and document the next review' from studies where accuracy_review is null or accuracy_review<current_date
 union all select id,name,'retention_review_due','Review whether responses are still needed' from studies where retention_review is null or retention_review<current_date
 union all select s.id,s.name,'source_stale','Review the wave export date; 30 days is an operating check' from studies s join datasets d on d.study_id=s.id where d.exported_at<now()-interval '30 days';
create view analysis_history as
 select a.id,d.study_id,s.name as study,d.name as dataset,a.name,a.revision,d.revision as current_revision,
 (a.revision<>d.revision) as stale,a.actor,a.created_at from analysis_runs a join datasets d on d.id=a.dataset_id join studies s on s.id=d.study_id;
