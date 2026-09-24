const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const statusMap={pending:["قيد المراجعة","status-pending"],approved:["مقبول","status-approved"],rejected:["مرفوض","status-rejected"],in_progress:["قيد التنفيذ","status-progress"],completed:["مكتمل","status-complete"]};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
(async()=>{
 const {data:{user}}=await client.auth.getUser(); if(!user){location.href="auth.html";return;}
 const p=await client.from("profiles").select("is_admin,username,full_name").eq("id",user.id).maybeSingle();
 const profile=p.data||{};
 document.querySelector("#welcome").innerHTML=profile.is_admin
 ? '<span class="owner-badge">♛ المالك</span><span class="owner-user">@'+esc(profile.username||"owner")+'</span><span class="owner-name">'+esc(profile.full_name||"")+'</span>'
 : 'مرحباً '+esc(profile.full_name||user.email||"");
 const adminLink=document.querySelector("#adminLink"); if(profile.is_admin)adminLink.style.display="inline-flex";
 const r=await client.from("project_requests").select("*").order("created_at",{ascending:false});
 const box=document.querySelector("#requests");
 if(r.error){box.innerHTML="<div class='empty-note'>تعذر تحميل الطلبات.</div>";return}
 if(!r.data.length){box.innerHTML="<div class='empty-note'><span>+</span><div><strong>ما عندك طلبات بعد.</strong><br>ابدأ أول مشروع من صفحة طلب مشروع.</div><a href='contact.html'>اطلب مشروع →</a></div>";return}
 box.innerHTML=r.data.map(x=>{const s=statusMap[x.status]||["غير معروف",""];return '<article class="request-card"><div><span class="tag">'+esc(x.project_type)+'</span><span class="request-status '+s[1]+'">'+s[0]+'</span></div><h2>'+esc(x.project_type)+'</h2><p>'+esc(x.message)+'</p><small>'+new Date(x.created_at).toLocaleString("ar-IQ")+'</small>'+(x.admin_note?'<div class="admin-note">ملاحظة: '+esc(x.admin_note)+'</div>':"")+'</article>'}).join("");
})();
document.querySelector("#logout").onclick=async e=>{e.preventDefault();await client.auth.signOut();location.href="index.html"};