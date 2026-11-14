#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {analyse,base} from './lib/analyse.mjs';
export const commands=['help','studies','datasets','detail','cases','variables','frequencies','crosstab','numeric','trend','weight-check','missingness','attention','compliance','weekly-review','imports','history','audit','add-study','update-study','import','exclude','restore','log','save-analysis','draft-report','export'];
export function parseArgs(args){const opts={},pos=[];for(const a of args){if(a.startsWith('--')){const eq=a.indexOf('=');const k=a.slice(2,eq<0?undefined:eq);if(k in opts)throw Error(`Repeated flag: ${k}`);opts[k]=eq<0?true:a.slice(eq+1);}else pos.push(a);}return {cmd:pos[0]||'help',pos:pos.slice(1),opts};}
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();};
const date=(v)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Expected a valid YYYY-MM-DD date');return v;};
const integer=v=>{if(!/^\d+$/.test(String(v))||Number(v)<2||Number(v)>1000000)throw Error('min-base must be an integer from 2 to 1000000');return Number(v);};
const allowedTables=['studies','datasets','variables','cases','analysis_runs','notes','audit_events'];
async function match(db,t,term,scope){if(!allowedTables.includes(t))throw Error('Invalid record type');const rows=await db.query(`select * from ${t}`);const scoped=scope?rows.filter(r=>r[scope.key]===scope.value):rows;let found=scoped.filter(r=>r.id===term||String(r.name||r.source_id||'').toLowerCase()===term.toLowerCase());if(!found.length)found=scoped.filter(r=>r.id.startsWith(term)||String(r.name||r.source_id||'').toLowerCase().includes(term.toLowerCase()));if(found.length!==1){const choices=(found.length?found:scoped).map(r=>({id:r.id,name:r.name||r.source_id}));throw Error(`${found.length?'Ambiguous':'No matching'} ${t}: ${term}\n${JSON.stringify(choices)}`);}return found[0];}
async function dataset(db,o){const scope=o.study?{key:'study_id',value:(await match(db,'studies',required(o,'study'))).id}:null;return match(db,'datasets',required(o,'dataset'),scope);}
async function input(db,d){return {cases:await db.query('select * from cases where dataset_id=$1 order by source_id',[d.id]),variables:await db.query('select * from variables where dataset_id=$1 order by name',[d.id]),study:(await db.query('select * from studies where id=$1',[d.study_id]))[0]};}
async function audit(db,actor,action,id,detail){await db.query('insert into audit_events(actor,action,record_id,detail) values($1,$2,$3,$4)',[actor,action,id,JSON.stringify(detail)]);}
async function transaction(db,fn){await db.exec('BEGIN');try{const r=await fn();await db.exec('COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function ready(db,study){const issues=await db.query("select * from study_attention where id=$1 and rule<>'source_stale'",[study.id]);if(issues.length)throw Error('Study review required: '+issues.map(x=>x.rule).join(', '));}
export function prepareImport(csv,mapping){
 if(!mapping||typeof mapping.id!=='string'||!Array.isArray(mapping.variables)||!mapping.variables.length)throw Error('Mapping needs id and variables');
 const rows=parseCsv(csv);if(!rows.length)throw Error('CSV contains no cases');
 const names=new Set();for(const v of mapping.variables){if(!v.name||!v.column||!['numeric','categorical'].includes(v.kind)||names.has(v.name)||['__proto__','constructor','prototype'].includes(v.name))throw Error('Invalid or duplicate variable mapping');names.add(v.name);if(v.missing!==undefined&&(!Array.isArray(v.missing)||v.missing.some(x=>typeof x!=='string')))throw Error('missing must be a list of text values');}
 const cols=[mapping.id,...(mapping.weight?[mapping.weight]:[]),...mapping.variables.map(v=>v.column)];for(const c of cols)if(!Object.hasOwn(rows[0],c))throw Error(`Missing source column: ${c}`);
 const ids=new Set();return rows.map((raw,i)=>{
 const id=raw[mapping.id].trim();if(!id||ids.has(id))throw Error(`Missing or duplicate respondent ID at row ${i+2}`);ids.add(id);
 const rawWeight=mapping.weight?raw[mapping.weight].trim():'1';const weight=Number(rawWeight);if(!rawWeight||!Number.isFinite(weight)||weight<0||weight>1e9)throw Error(`Invalid weight at row ${i+2}`);
 const answers={};for(const v of mapping.variables){const value=raw[v.column].trim();if(value===''||(v.missing||[]).includes(value))answers[v.name]=null;else if(v.kind==='numeric'){if((!Number.isFinite(Number(value))||Math.abs(Number(value))>1e12))throw Error(`Invalid number for ${v.name}, row ${i+2}`);answers[v.name]=Number(value);}else answers[v.name]=value;}
 return {source_id:id,weight,answers,raw};});
}
const common=['json'];
const flags={help:[],studies:[],datasets:[],detail:['dataset','study'],cases:['dataset','study'],variables:['dataset','study'],frequencies:['dataset','study','variable','by'],crosstab:['dataset','study','variable','by'],numeric:['dataset','study','variable','by'],trend:['study','variable','kind'], 'weight-check':['dataset','study'],missingness:['dataset','study'],attention:[],compliance:[], 'weekly-review':[],imports:[],history:[],audit:[], 'add-study':['name','owner','purpose','accuracy-review','retention-review','min-base','actor'],'update-study':['study','owner','purpose','accuracy-review','retention-review','min-base','actor','reason'],import:['study','name','file','map','source','exported-at','actor','dry-run'],exclude:['dataset','study','case','reason','actor'],restore:['dataset','study','case','reason','actor'],log:['study','text','actor'],'save-analysis':['dataset','study','variable','by','kind','name','actor'],'draft-report':['run'],export:['out']};
export async function execute(db,args){
 const {cmd,pos,opts:o}=parseArgs(args);if(!commands.includes(cmd))throw Error(`Unknown command: ${cmd}`);for(const k of Object.keys(o))if(![...common,...flags[cmd]].includes(k))throw Error(`Unknown flag --${k} for ${cmd}`);
 if((cmd==='import'&&pos.join(' ')!=='q-research')||(cmd!=='import'&&pos.length))throw Error('Unexpected argument; import needs q-research');
 if(cmd==='help')return commands.map(command=>({command,flags:flags[command].map(k=>'--'+k).join(' ')}));
 const simple={studies:'select * from studies order by name',datasets:'select * from dataset_health order by study,dataset',attention:'select * from study_attention order by study,rule',compliance:"select * from study_attention where rule<>'source_stale' order by study,rule",imports:'select id,name,source,exported_at,fingerprint,revision from datasets order by exported_at',history:'select * from analysis_history order by created_at',audit:'select * from audit_events order by created_at'};
 if(simple[cmd])return db.query(simple[cmd]);
 if(cmd==='weekly-review')return {datasets:await execute(db,['datasets']),attention:await execute(db,['attention']),stale_analyses:(await execute(db,['history'])).filter(r=>r.stale)};
 if(cmd==='add-study'||cmd==='update-study')return transaction(db,async()=>{
 const actor=required(o,'actor');const min=o['min-base']===undefined?undefined:integer(o['min-base']);
 if(cmd==='add-study'){const row=(await db.query('insert into studies(name,owner,purpose,accuracy_review,retention_review,min_base) values($1,$2,$3,$4,$5,$6) returning *',[required(o,'name'),required(o,'owner'),required(o,'purpose'),date(required(o,'accuracy-review')),date(required(o,'retention-review')),min??5]))[0];await audit(db,actor,cmd,row.id,{name:row.name});return [row];}
 const s=await match(db,'studies',required(o,'study'));await db.query('select id from studies where id=$1 for update',[s.id]);const patch={owner:o.owner??s.owner,purpose:o.purpose??s.purpose,accuracy_review:o['accuracy-review']===undefined?s.accuracy_review:date(required(o,'accuracy-review')),retention_review:o['retention-review']===undefined?s.retention_review:date(required(o,'retention-review')),min_base:min??s.min_base};required(o,'reason');
 const r=await db.query('update studies set owner=$2,purpose=$3,accuracy_review=$4,retention_review=$5,min_base=$6 where id=$1 returning *',[s.id,...Object.values(patch)]);
 // Any study policy change invalidates saved analyses, not only respondent exclusions.
 await db.query('update datasets set revision=revision+1 where study_id=$1',[s.id]);await audit(db,actor,cmd,s.id,{before:s,after:patch,reason:o.reason});return r;
 });
 if(cmd==='import'){
 const actor=required(o,'actor'),s=await match(db,'studies',required(o,'study'));const name=required(o,'name'),source=required(o,'source'),when=required(o,'exported-at');if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(when)||!Number.isFinite(Date.parse(when))||Date.parse(when)>Date.now())throw Error('exported-at must be a valid past UTC timestamp');date(when.slice(0,10));
 const csv=fs.readFileSync(required(o,'file'),'utf8'),mapping=JSON.parse(fs.readFileSync(required(o,'map'),'utf8')),rows=prepareImport(csv,mapping);const hash=crypto.createHash('sha256').update(csv+'\n'+JSON.stringify(mapping)+'\n'+source+'\n'+when).digest('hex');
 const existing=await db.query('select * from datasets where study_id=$1 and name=$2',[s.id,name]);if(existing.length){if(existing[0].fingerprint!==hash)throw Error('Dataset name already exists with different input; import as a new wave');return [{dataset:existing[0].id,status:'already imported',cases:rows.length}];}
 if(o['dry-run'])return [{status:'dry run',cases:rows.length,variables:mapping.variables.length,zero_weights:rows.filter(x=>x.weight===0).length,unmapped_columns:Object.keys(rows[0].raw).filter(x=>![mapping.id,mapping.weight,...mapping.variables.map(v=>v.column)].includes(x)).join(', ')}];
 return transaction(db,async()=>{const d=(await db.query('insert into datasets(study_id,name,source,exported_at,fingerprint,mapping) values($1,$2,$3,$4,$5,$6) returning *',[s.id,name,source,when,hash,JSON.stringify(mapping)]))[0];
 for(const v of mapping.variables)await db.query('insert into variables(dataset_id,name,source_column,kind,missing) values($1,$2,$3,$4,$5)',[d.id,v.name,v.column,v.kind,JSON.stringify(v.missing||[''])]);
 for(const r of rows)await db.query('insert into cases(dataset_id,source_id,weight,answers,raw) values($1,$2,$3,$4,$5)',[d.id,r.source_id,r.weight,JSON.stringify(r.answers),JSON.stringify(r.raw)]);
 await audit(db,actor,cmd,d.id,{fingerprint:hash,source,cases:rows.length});return [{dataset:d.id,status:'imported',cases:rows.length}];});
 }
 if(cmd==='log')return transaction(db,async()=>{const actor=required(o,'actor'),s=await match(db,'studies',required(o,'study'));const r=await db.query('insert into notes(study_id,body,actor) values($1,$2,$3) returning *',[s.id,required(o,'text'),actor]);await audit(db,actor,cmd,s.id,{note:r[0].id});return r;});
 if(cmd==='export'){
 const out=path.resolve(required(o,'out'));if(!out.endsWith('.json'))throw Error('Export path must end .json');
 await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{const archive={format:'survey-tabulation-v1',exported_at:new Date().toISOString(),records:{}};for(const t of allowedTables)archive.records[t]=await db.query(`select * from ${t}`);fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify(archive,null,2),{flag:'wx',mode:0o600});return [{file:out,record_types:allowedTables.length}];}finally{await db.exec('ROLLBACK');}
 }
 if(cmd==='draft-report'){
 const prefix=required(o,'run');const runs=await db.query('select * from analysis_runs where id::text like $1',[prefix+'%']);if(runs.length!==1)throw Error('Run must match one ID: '+JSON.stringify(runs.map(r=>({id:r.id,name:r.name}))));const run=runs[0];const d=(await db.query('select * from datasets where id=$1',[run.dataset_id]))[0],data=await input(db,d);await ready(db,data.study);if(run.revision!==d.revision)throw Error('Saved analysis is stale; create a fresh analysis');
 const dir=path.join(REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`research-${run.id}.md`);fs.writeFileSync(file,`# ${run.name}\n\nInternal draft. Descriptive estimates only. Not approved for disclosure.\n\nStudy: ${data.study.name}\nWave: ${d.name}\nSource: ${d.source}\nExport: ${d.exported_at}\nRevision: ${run.revision}\nSpecification: ${JSON.stringify(run.specification)}\n\n${format(run.result)}\n\nReview sampling, weighting, missing data and disclosure risk before release. Low-base masking is not anonymisation.\n`,{flag:'wx',mode:0o600});return [{file,status:'draft, not sent'}];
 }
 if(cmd==='trend'){
 const s=await match(db,'studies',required(o,'study')),variable=required(o,'variable');const datasets=await db.query('select * from datasets where study_id=$1 order by exported_at',[s.id]);const out=[];for(const d of datasets){const data=await input(db,d);const rows=analyse(data.cases,data.variables,{kind:o.kind||'frequencies',variable},s.min_base);out.push(...rows.map(r=>({wave:d.name,exported_at:d.exported_at,...r})));}return out;
 }
 const d=await dataset(db,o),data=await input(db,d);
 if(cmd==='detail')return {dataset:d,study:data.study,variables:data.variables,health:(await db.query('select * from dataset_health where id=$1',[d.id]))[0],notes:await db.query('select * from notes where study_id=$1 order by created_at',[d.study_id])};
 if(cmd==='variables')return data.variables;
 if(cmd==='cases')return data.cases.map(r=>({id:r.id,respondent:r.source_id,weight:r.weight,excluded:r.excluded,reason:r.exclusion_reason}));
 if(cmd==='missingness')return data.variables.map(v=>{const active=data.cases.filter(r=>!r.excluded&&r.weight>0);return {variable:v.name,kind:v.kind,active_cases:active.length,missing:active.filter(r=>r.answers[v.name]===null||r.answers[v.name]===undefined).length};});
 if(cmd==='weight-check'){const active=data.cases.filter(r=>!r.excluded&&r.weight>0);const b=base(active);return [{dataset:d.name,...b,excluded:data.cases.filter(r=>r.excluded).length,zero_weight:data.cases.filter(r=>!r.excluded&&r.weight===0).length,min:active.length?Math.min(...active.map(r=>r.weight)):null,max:active.length?Math.max(...active.map(r=>r.weight)):null,efficiency_percent:b.base?Math.round(100*b.effective_base/b.base):0,meaning:'Kish weight-only effective base, not a survey-design correction'}];}
 if(cmd==='exclude'||cmd==='restore')return transaction(db,async()=>{
 const actor=required(o,'actor');await db.query('select id from datasets where id=$1 for update',[d.id]);const c=await match(db,'cases',required(o,'case'),{key:'dataset_id',value:d.id});const reason=required(o,'reason');await db.query('update cases set excluded=$2,exclusion_reason=$3 where id=$1',[c.id,cmd==='exclude',reason]);await db.query('update datasets set revision=revision+1 where id=$1',[d.id]);await audit(db,actor,cmd,c.id,{dataset:d.id,reason,was_excluded:c.excluded});return [{case:c.source_id,excluded:cmd==='exclude',reason}];
 });
 const specification={kind:cmd==='save-analysis'?(o.kind||'frequencies'):cmd,variable:required(o,'variable'),...(o.by?{by:required(o,'by')}:{})};
 if(cmd==='save-analysis')return transaction(db,async()=>{
 const actor=required(o,'actor');await db.query('select id from studies where id=$1 for update',[d.study_id]);const fresh=(await db.query('select * from datasets where id=$1 for update',[d.id]))[0],current=await input(db,fresh);await ready(db,current.study);const result=analyse(current.cases,current.variables,specification,current.study.min_base);const run=(await db.query('insert into analysis_runs(dataset_id,revision,name,specification,result,actor) values($1,$2,$3,$4,$5,$6) returning id,name,revision',[d.id,fresh.revision,required(o,'name'),JSON.stringify({...specification,min_base:current.study.min_base,method_version:'1',source_fingerprint:fresh.fingerprint,source_exported_at:fresh.exported_at}),JSON.stringify(result),actor]))[0];await audit(db,actor,cmd,run.id,{dataset:d.id,specification});return [run];
 });
 return analyse(data.cases,data.variables,specification,data.study.min_base);
}
export function format(value){if(Array.isArray(value)){if(!value.length)return '(none)';const rows=value.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='object'&&v!==null?JSON.stringify(v):v])));const keys=[...new Set(rows.flatMap(Object.keys))];return table(rows,keys.map(key=>({key,label:key,width:60})));}return Object.entries(value).map(([k,v])=>`${k}\n${format(Array.isArray(v)?v:[v])}`).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}}
