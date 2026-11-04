import{i as e,t}from"./runbook-DIZW6Ywj.js";import{A as n,C as r,E as i,F as a,L as o,O as s,P as c,R as l,i as u,j as d,k as f,m as p,n as m,r as h,v as g,w as _,x as v,y}from"./index-client-B55Gs7es.js";import{a as b,i as x,n as S,o as C,r as w,t as T}from"./EngineeringUpdate-B3l0Fva3.js";import{t as E}from"./Callout-Dr0hB_BS.js";import{t as D}from"./RenderStamp-DOSHZtmg.js";var O=v(`<tr><td><code> </code></td><td> </td><td> </td><td> </td></tr>`),k=v(`<p><strong> </strong> reports are listed in the desk's <code>oneDayMove</code> notes.
  They remain included in their assigned cause's count; they are not extra reports.</p> <table><thead><tr><th>report</th><th>tenant / channel</th><th>reporter's words</th><th>assigned cause</th></tr></thead><tbody></tbody></table>`,1);function A(e,t){a(t,!1),u();var r=k(),m=f(r),h=s(m),v=n(h,!0);o(3),l(m);var b=d(m,2),S=d(s(b));p(S,5,()=>x,e=>e.id,(e,t)=>{var r=O(),a=s(r),o=s(a),c=n(o,!0);l(a);var u=d(a),f=n(u),p=d(u),m=n(p,!0),h=d(p),v=n(h,!0);l(r),i(e=>{g(c,_(t).id),g(f,`${_(t).tenant??``} / ${_(t).channel??``}`),g(m,_(t).body),g(v,e)},[()=>w(_(t))]),y(e,r)}),l(S),l(b),i(()=>g(v,x.length)),y(e,r),c()}var j=e({default:()=>V,metadata:()=>M}),M={layout:`runbook`,title:`#4471 review · separate causes and unresolved timing symptoms`,owner:`j3apyye`,status:`closed-per-desk`,reviewed:`2026-11-04`,signature:`j3apyye / Codex`},{layout:N,title:P,owner:F,status:I,reviewed:L,signature:R}=M,z=new Set([`$$slots`,`$$events`,`$$legacy`]),B=v(`<p>The exported version of the <a href="/kb/incidents/4471">original incident</a> described the merged
reports as one parser problem with one fix queued. Its own computed table did not support that conclusion.
The booking form’s hint and the shared parser are separate failure paths. Keeping them in
one ticket can hide the form problem behind the parser’s queued fix.</p> <p>This review uses the supplied export, not a live production investigation. Counts below
come from the report IDs, tenant directory and executable classifier at render time.
They measure report assignments; they do not prove the production cause of every report.</p> <h2>Reconcile the export</h2> <!> <p>The export’s pages overlap. Deduplicate by report ID before filtering to #4471, grouping,
or drawing a timeline. Different IDs remain separate reports even when their words match.
The browser’s locale and intake tag are guesses, not substitutes for the tenant directory.</p> <h2>Separate the problems</h2> <!> <p>The ticket column reflects the supplied export, before this review’s GitHub filings.</p> <p><strong>Parser: day-first dates read month first.</strong> The shared-parser behavior described in <code>src/lib/kb/causes.ts</code> reads dates month first. For a tenant using day-first dates, <code>07/04/2026</code> intended as 7 April can become 4 July. Harbour Dental’s app reports
R-41200 and R-41201 show this swap. Keep this problem in its own parser ticket.
Use the parser row’s count above, including its explicitly marked exceptions.</p> <p><strong>Hint: booking-v3 tells people to enter the other order.</strong> For day-first tenants,
booking-v3 prints <code>MM/DD/YYYY</code>, while its form reads dates in the tenant’s order.
The form can therefore misread an entry even if the shared parser is fixed.
Copper Studio’s form report R-41230 and Alder Physio’s form report R-41241 follow
this path. File a separate form-hint ticket with the hint row’s count above.</p> <p>The classifier uses <code>Intl.DateTimeFormat</code> to determine the tenant’s date order, then
checks the report’s channel and the tenant’s form version. A booking-v3 tenant’s app
or email report still follows the parser rule; the hint rule applies to its form reports.
Do not count causes from intake tags or split them from subject lines alone.</p> <h2>Filed tickets</h2> <ul><li><a href="https://github.com/j3apyye/mega-s01e03-what-it-shows/issues/1" rel="nofollow">Parser investigation</a></li> <li><a href="https://github.com/j3apyye/mega-s01e03-what-it-shows/issues/2" rel="nofollow">Hint investigation</a></li></ul> <p>The cause counts above are the report assignments from the supplied export. The GitHub
issues track the separate investigations; their issue numbers differ from source ticket #4471.</p> <h2>Engineering outcome</h2> <!> <p>Close the parser investigation as completed according to the reported fix. Close the
form-hint investigation as not planned because its form was retired, rather than
claiming that the hint was repaired. These are the course’s engineering outcomes;
this export does not let us reproduce the production fix independently.</p> <p>The timing reports below remain historical evidence requiring reproduction if the
symptoms recur. Their assigned count does not establish that engineering verified
each symptom individually. Do not merge a new report into a closed ticket solely
because the old classifier gives it the same modeled cause.</p> <h2>Do not explain away the timing reports</h2> <!> <p>The desk’s note label is broader than the words in the reports. R-41236 says the invite
arrived before the booking; it does not actually describe a one-day move. R-41344 says
people in Lisbon and Toronto saw different weekdays. A timezone explanation is plausible,
but this export has no event instants, timezone settings or invite payloads to establish it.</p> <p>R-41202, R-41209 and R-41620 describe day discrepancies that the month/day-swap example
does not explain. Keep their IDs visible in the parser investigation and obtain the
original entered date, stored timestamp, timezone, rendered invite and reproduction steps.
Do not claim they are a proven shared third bug, subtract them silently, or count them twice.</p> <p>R-41620 also says the reporter stopped reporting these failures. A smaller incoming count
would therefore not, by itself, establish that the problem had been fixed.</p> <!> <h2>The desk kept merging reports</h2> <!> <p>The chart separates when reports arrived from when the desk merged them. A bulk merge
is a desk action, not a sudden increase in product failures. Reports continued after the
bulk merge; “known” did not mean resolved in this snapshot.</p> <h2>Keep the next reports separate</h2> <p>Use the <a href="/kb/triage/dedupe">updated triage guidance</a> and <a href="/kb/decisions/0002-dedupe-by-cause">replacement decision</a>. Matching words can identify
candidates to read, but cannot establish a common cause. Check tenant locale, form version,
channel and the body before merging. Same-subject app and form reports from Alder Physio
can belong to different problems; different-subject app and email reports from Kettle Books
can belong to the same parser problem.</p> <p>Unknown tenants and bodies that do not fit the supposed cause need investigation, not an
automatic merge. Preserve report IDs and recompute the totals as the desk receives reports.
Recheck the page after a fix or fresh export; these counts describe this snapshot only.</p> <p>Prepared by Codex for j3apyye. The signature identifies this review, not an approval or
production verification by the support desk.</p> <!>`,1);function V(e,n){let i=m(n,z);t(e,h(()=>i,()=>M,{children:(e,t)=>{var n=B(),i=d(f(n),6);S(i,{});var a=d(i,6);C(a,{ticket:4471});var s=d(a,18);T(s,{});var c=d(s,8);A(c,{});var l=d(c,8);E(l,{kind:`warn`,children:(e,t)=>{o();var n=r(`The classifier assigns a cause from tenant and channel; it never reads the report body.
Its result is useful routing evidence, not proof that contradictory symptoms are resolved.`);y(e,n)},$$slots:{default:!0}});var u=d(l,4);b(u,{ticket:4471});var p=d(u,12);D(p,{get signature(){return R}}),y(e,n)},$$slots:{default:!0}}))}export{V as n,M as r,j as t};