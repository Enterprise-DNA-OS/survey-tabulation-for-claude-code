// Descriptive weighted estimates. No significance tests or sampling-error claims.
const round=n=>Number.isFinite(n)?Math.round(n*1e6)/1e6:null;
export function base(rows){const sum=rows.reduce((s,r)=>s+r.weight,0),sq=rows.reduce((s,r)=>s+r.weight*r.weight,0);return {base:rows.length,weighted_base:round(sum),effective_base:sq?round(sum*sum/sq):0};}
export function analyse(cases,variables,{kind='frequencies',variable,by},minBase=5){
 const v=variables.find(x=>x.name===variable);if(!v)throw Error(`Unknown variable: ${variable}`);
 if(kind==='numeric'&&v.kind!=='numeric')throw Error('numeric requires a numeric variable');
 if(!['frequencies','crosstab','numeric'].includes(kind))throw Error('Unknown analysis kind');
 if(kind==='crosstab'&&!by)throw Error('crosstab requires --by');
 if(by&&!variables.some(x=>x.name===by&&x.kind==='categorical'))throw Error('Group variable must be categorical');
 const active=cases.filter(r=>!r.excluded&&r.weight>0);
 const groups=by?[...new Set(active.map(r=>r.answers[by]).filter(x=>x!==null&&x!==undefined))].sort():['All'];
 return groups.flatMap(group=>{
 const members=active.filter(r=>!by||r.answers[by]===group),valid=members.filter(r=>r.answers[variable]!==null&&r.answers[variable]!==undefined);
 const b=base(valid),common={group,variable,...b,missing:members.length-valid.length};
 if(b.base<minBase)return [{...common,status:'low base',category:null,count:null,weighted_count:null,percent:null,mean:null}];
 if(kind==='numeric')return [{...common,status:'descriptive',mean:round(valid.reduce((s,r)=>s+r.answers[variable]*r.weight,0)/b.weighted_base),min:Math.min(...valid.map(r=>r.answers[variable])),max:Math.max(...valid.map(r=>r.answers[variable]))}];
 return [...new Set(valid.map(r=>r.answers[variable]))].sort().map(category=>{const matches=valid.filter(r=>r.answers[variable]===category);const w=matches.reduce((s,r)=>s+r.weight,0);return {...common,status:'descriptive',category,count:matches.length,weighted_count:round(w),percent:round(100*w/b.weighted_base)};});
 });
}
