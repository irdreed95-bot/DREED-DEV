const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);

let signup=false;
const form=document.querySelector("#authForm");
const msg=document.querySelector("#authMsg");
const name=document.querySelector("#fullName");
const title=document.querySelector("#authTitle");
const hint=document.querySelector("#authHint");
const sw=document.querySelector("#switchAuth");
const resend=document.querySelector("#resendConfirm");

const redirectUrl=new URL("auth.html",window.location.href).href;

function mode(){
  name.parentElement.style.display=signup?"grid":"none";
  title.textContent=signup?"إنشاء حساب":"دخول العميل";
  hint.textContent=signup?"أنشئ حساب حتى تحفظ وتتابع طلباتك.":"سجّل دخولك حتى تتابع طلباتك.";
  sw.textContent=signup?"عندي حساب — تسجيل الدخول":"ما عندي حساب — إنشاء حساب";
  resend.style.display=signup?"none":"inline-flex";
}
sw.onclick=()=>{signup=!signup;mode()};
mode();

async function handleExistingSession(){
  const {data}=await client.auth.getSession();
  if(data.session) location.href="account.html";
}
handleExistingSession();

form.onsubmit=async e=>{
  e.preventDefault();
  msg.textContent="جارٍ التنفيذ…";
  const email=document.querySelector("#email").value.trim();
  const password=document.querySelector("#password").value;

  const r=signup
    ?await client.auth.signUp({
        email,
        password,
        options:{
          data:{full_name:name.value.trim()},
          emailRedirectTo:redirectUrl
        }
      })
    :await client.auth.signInWithPassword({email,password});

  if(r.error){
    msg.textContent=r.error.message;
    return;
  }

  if(signup){
    msg.textContent="تم إنشاء الحساب. افتح رسالة التأكيد الجديدة على إيميلك، وبعد الضغط عليها راح يرجعك للموقع.";
  }else{
    location.href="account.html";
  }
};

resend.onclick=async()=>{
  const email=document.querySelector("#email").value.trim();
  if(!email){
    msg.textContent="اكتب الإيميل أولاً.";
    return;
  }
  msg.textContent="جارٍ إرسال رابط تأكيد جديد…";
  const r=await client.auth.resend({
    type:"signup",
    email,
    options:{emailRedirectTo:redirectUrl}
  });
  msg.textContent=r.error
    ?r.error.message
    :"تم إرسال رابط تأكيد جديد. افتح أحدث رسالة فقط.";
};