const profileClient=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const form=document.querySelector("#profileForm"),msg=document.querySelector("#profileMsg"),avatar=document.querySelector("#avatar"),fileInput=document.querySelector("#avatarFile");
let currentUser=null,currentProfile={};
const fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' rx='100' fill='%23151a20'/%3E%3Ctext x='100' y='118' text-anchor='middle' fill='%23c7ff4a' font-size='82' font-family='Arial'>D</text></svg>";
const setMsg=t=>{msg.textContent=t;};
function renderProfile(){
 const p=currentProfile||{}, username=p.username||"", name=p.full_name||currentUser?.user_metadata?.full_name||"";
 document.querySelector("#username").value=username;
 document.querySelector("#fullName").value=name;
 document.querySelector("#phone").value=p.phone||"";
 document.querySelector("#email").value=currentUser?.email||"";
 document.querySelector("#profileEmail").textContent=currentUser?.email||"";
 document.querySelector("#profileTitle").textContent=username?"@"+username:"حسابي";
 document.querySelector("#profileUsername").textContent=username?"@"+username:"";
 document.querySelector("#profileName").textContent=name;
 document.querySelector("#ownerBadge").hidden=!p.is_admin;
 avatar.src=p.avatar_url||fallback;
}
async function loadProfile(){
 const {data:{user},error}=await profileClient.auth.getUser();
 if(error||!user){location.href="auth.html";return;}
 currentUser=user;
 const {data,error:pe}=await profileClient.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(pe){setMsg("تعذر تحميل بيانات الحساب: "+pe.message);return;}
 currentProfile=data||{};
 renderProfile();
}
fileInput.onchange=async()=>{
 const file=fileInput.files?.[0]; if(!file||!currentUser)return;
 if(file.size>5*1024*1024){setMsg("الصورة لازم تكون أقل من 5MB.");return;}
 setMsg("جارٍ رفع الصورة…");
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
 const path=currentUser.id+"/avatar."+ext;
 const up=await profileClient.storage.from("avatars").upload(path,file,{upsert:true,contentType:file.type});
 if(up.error){setMsg("تعذر رفع الصورة: "+up.error.message);return;}
 const {data:url}=profileClient.storage.from("avatars").getPublicUrl(path);
 const saved=await profileClient.from("profiles").update({avatar_url:url.publicUrl}).eq("id",currentUser.id);
 if(saved.error){setMsg("تم رفع الصورة لكن تعذر حفظها: "+saved.error.message);return;}
 currentProfile.avatar_url=url.publicUrl; avatar.src=url.publicUrl; setMsg("تم تحديث الصورة ✓");
};
form.onsubmit=async e=>{
 e.preventDefault(); setMsg("جارٍ حفظ التغييرات…");
 const username=document.querySelector("#username").value.trim().replace(/\s+/g,"_");
 const full_name=document.querySelector("#fullName").value.trim();
 const phone=document.querySelector("#phone").value.trim();
 const email=document.querySelector("#email").value.trim();
 if(username&&!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)){setMsg("اسم المستخدم: 3-30 حرف، إنكليزي/أرقام/._- فقط.");return;}
 const u=await profileClient.from("profiles").update({username:username||null,full_name,phone}).eq("id",currentUser.id);
 if(u.error){setMsg("تعذر حفظ البيانات: "+u.error.message);return;}
 currentProfile={...currentProfile,username:username||null,full_name,phone};
 renderProfile();
 if(email&&email!==(currentUser.email||"")){
   const er=await profileClient.auth.updateUser({email});
   if(er.error){setMsg("تم حفظ الاسم واليوزر والرقم، لكن تعذر تغيير الإيميل: "+er.error.message);return;}
   setMsg("تم حفظ البيانات ✓ وقد تحتاج لتأكيد الإيميل الجديد.");
 }else setMsg("تم حفظ بيانات الحساب بنجاح ✓");
};
loadProfile();