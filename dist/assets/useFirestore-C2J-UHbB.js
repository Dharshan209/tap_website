import{r as t}from"./vendor-BHX-4vy9.js";import{o as e,h as a,i as s,n as r,q as d,t as n,v as l,w as c,f as o,x as u,y as i,z as m,T as h,A as p,C as A,D as f,E as g,F as y,G as w}from"./index-DSv-p_Z0.js";const b=t=>{if(!t)return null;try{return t instanceof h?t.toDate().toISOString():t}catch(e){return null}},k=(t,e=[],a=[],s=null,r={})=>{let d=t;return e&&e.length>0&&(d=p(d,...e.map((({field:t,operator:e,value:a})=>A(t,e,a))))),a&&a.length>0&&(d=p(d,...a.map((({field:t,direction:e="asc"})=>f(t,e))))),r.startAfter&&(d=p(d,g(r.startAfter))),r.endBefore&&(d=p(d,y(r.endBefore))),s&&(d=p(d,w(s))),d},D=h=>{const[p,A]=t.useState([]),[f,g]=t.useState(!1),[y,w]=t.useState(null),[D,C]=t.useState({currentPage:1,totalDocuments:0,hasMore:!1});return{data:p,loading:f,error:y,pagination:D,clearError:t.useCallback((()=>{w(null)}),[]),addDocument:t.useCallback((async(t,l=null)=>{g(!0),w(null);try{const c={...t,createdAt:e(),updatedAt:e()};let o;return l?(o=a(s,h,l),await r(o,c)):o=await d(n(s,h),c),g(!1),{id:o.id,...c}}catch(c){throw w({message:"Failed to add document",details:c.message}),g(!1),c}}),[h]),updateDocument:t.useCallback((async(t,r)=>{g(!0),w(null);try{const d=a(s,h,t);return await l(d,{...r,updatedAt:e()}),g(!1),!0}catch(d){throw w({message:"Failed to update document",details:d.message}),g(!1),d}}),[h]),deleteDocument:t.useCallback((async t=>{g(!0),w(null);try{const e=a(s,h,t);return await c(e),g(!1),!0}catch(e){throw w({message:"Failed to delete document",details:e.message}),g(!1),e}}),[h]),getDocument:t.useCallback((async t=>{g(!0),w(null);try{const e=a(s,h,t),r=await o(e);if(r.exists()){const t=r.data();return g(!1),{id:r.id,...t,createdAt:b(t.createdAt),updatedAt:b(t.updatedAt)}}return w({message:"Document not found"}),g(!1),null}catch(e){throw w({message:"Failed to fetch document",details:e.message}),g(!1),e}}),[h]),getDocuments:t.useCallback((async(t={constraints:[],orderBy:[],limit:10,startAfter:null,endBefore:null})=>{g(!0),w(null);try{const e=n(s,h),a=k(e,t.constraints,t.orderBy,t.limit,{startAfter:t.startAfter,endBefore:t.endBefore}),r=(await u(a)).docs.map((t=>({id:t.id,...t.data(),createdAt:b(t.data().createdAt),updatedAt:b(t.data().updatedAt)})));return C((e=>({...e,totalDocuments:r.length,hasMore:r.length===t.limit}))),A(r),g(!1),r}catch(e){throw w({message:"Failed to fetch documents",details:e.message}),g(!1),e}}),[h]),subscribeToDocument:t.useCallback(((t,e)=>{const r=a(s,h,t);return i(r,(t=>{if(t.exists()){const a=t.data(),s={id:t.id,...a,createdAt:b(a.createdAt),updatedAt:b(a.updatedAt)};e(null,s)}else e(new Error("Document does not exist"),null)}),(t=>{e(t,null)}))}),[h]),subscribeToCollection:t.useCallback(((t={constraints:[],orderBy:[],limit:10},e)=>{const a=n(s,h),r=k(a,t.constraints,t.orderBy,t.limit);return i(r,(t=>{const a=t.docs.map((t=>({id:t.id,...t.data(),createdAt:b(t.data().createdAt),updatedAt:b(t.data().updatedAt)})));e(null,a)}),(t=>{e(t,null)}))}),[h]),batchWrite:t.useCallback((async t=>{g(!0),w(null);try{const r=m(s);return t.forEach((({type:t,id:d,data:n})=>{const l=a(s,h,d);switch(t){case"create":r.set(l,{...n,createdAt:e(),updatedAt:e()});break;case"update":r.update(l,{...n,updatedAt:e()});break;case"delete":r.delete(l);break;default:throw new Error(`Invalid batch operation type: ${t}`)}})),await r.commit(),g(!1),!0}catch(r){throw w({message:"Batch write failed",details:r.message}),g(!1),r}}),[h])}};export{D as u};
