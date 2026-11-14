do $$declare sid uuid; did uuid; i integer; begin
 if exists(select 1 from studies where name='Harbour Shopper Study') then return; end if;
 insert into studies(name,owner,purpose,accuracy_review,retention_review,min_base) values
 ('Harbour Shopper Study','Research lead','Synthetic shopper research demonstration',current_date+30,current_date+180,5) returning id into sid;
 insert into datasets(study_id,name,source,exported_at,fingerprint,mapping) values(sid,'November wave','Synthetic demonstration',now()-interval '2 days','seed-november','{}') returning id into did;
 insert into variables(dataset_id,name,source_column,kind) values(did,'region','Region','categorical'),(did,'choice','Choice','categorical'),(did,'rating','Rating','numeric');
 for i in 1..16 loop
 insert into cases(dataset_id,source_id,weight,answers,raw) values(did,'R'||i,case when i<=8 then 1 else 2 end,
 jsonb_build_object('region',case when i<=8 then 'North' else 'South' end,'choice',case when i%3=0 then 'Store' else 'Online' end,'rating',case when i=16 then null else (i%5)+1 end),jsonb_build_object('synthetic',true));
 end loop;
 insert into datasets(study_id,name,source,exported_at,fingerprint,mapping) values(sid,'October wave','Synthetic demonstration',now()-interval '40 days','seed-october','{}') returning id into did;
 insert into variables(dataset_id,name,source_column,kind) values(did,'region','Region','categorical'),(did,'choice','Choice','categorical'),(did,'rating','Rating','numeric');
 for i in 1..12 loop
 insert into cases(dataset_id,source_id,weight,answers,raw) values(did,'P'||i,1,jsonb_build_object('region',case when i<=6 then 'North' else 'South' end,'choice',case when i%2=0 then 'Store' else 'Online' end,'rating',(i%5)+1),jsonb_build_object('synthetic',true));
 end loop;
 insert into studies(name,owner,purpose,accuracy_review,retention_review) values('Lapsed Concept Study','','',current_date-10,current_date-1);
 insert into audit_events(action,record_id,actor,detail) values('seed',sid,'Demo operator','{"synthetic":true}');
end$$;
