const requestClient=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const requestForm=document.querySelector("#projectForm"),notice=document.querySelector("#loginNotice");
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
(async()=>{
 const {data:{user}}=await requestClient.auth.getUser();
 if(!user){notice.innerHTML='تريد تتابع طلبك؟ <a href="auth.html">سجّل دخولك أو أنشئ حساب</a>.';return}
 notice.textContent="أنت مسجل دخول. بعد الإرسال يظهر الطلب مباشرة داخل «طلباتي».";
 requestForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const fd=new FormData(requestForm),btn=requestForm.querySelector("button");
  const customerEmail=String(fd.get("email")||"").trim().toLowerCase();
  if(!validEmail(customerEmail)){notice.textContent="اكتب بريد إلكتروني صحيح حتى نكدر نتواصل وياك.";return}
  const name=String(fd.get("name")||user.user_metadata?.full_name||"عميل").trim();
  const type=String(fd.get("type")||"مشروع").trim();
  const message=String(fd.get("message")||"").trim();
  if(!name||!message){notice.textContent="كمل الاسم وتفاصيل المشروع.";return}
  btn.disabled=true;btn.textContent="جارٍ إرسال الطلب…";
  const {error}=await requestClient.from("project_requests").insert({user_id:user.id,name,email:customerEmail,project_type:type,message});
  if(error){notice.textContent="تعذر حفظ الطلب: "+error.message;btn.disabled=false;btn.textContent="إرسال الطلب ↗";return}
  notice.textContent="تم إرسال طلبك بنجاح. تقدر تتابع حالته من صفحة طلباتي.";
  requestForm.reset();btn.textContent="تم إرسال الطلب ✓";
  setTimeout(()=>location.href="account.html",900);
 });
})();