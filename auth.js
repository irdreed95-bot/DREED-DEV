const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);

let signup=false;
const form=document.querySelector("#authForm");
const msg=document.querySelector("#authMsg");
const name=document.querySelector("#fullName");
const nameWrap=document.querySelector("#fullNameWrap");
const title=document.querySelector("#authTitle");
const hint=document.querySelector("#authHint");
const sw=document.querySelector("#switchAuth");
const forgot=document.querySelector("#forgotPassword");
const resend=document.querySelector("#resendConfirm");

const siteRoot=new URL("./",window.location.href).href;
const redirectUrl=new URL("auth.html",siteRoot).href;
const resetUrl=new URL("reset-password.html",siteRoot).href;

function showMessage(text){
  msg.textContent=text;
}

function mode(){
  nameWrap.style.display=signup?"grid":"none";
  title.textContent=signup?"إنشاء حساب":"دخول العميل";
  hint.textContent=signup
    ?"أنشئ حساب حتى تحفظ وتتابع طلباتك."
    :"سجّل دخولك حتى تتابع طلباتك.";
  sw.textContent=signup
    ?"عندي حساب — تسجيل الدخول"
    :"ما عندي حساب — إنشاء حساب";
  forgot.style.display=signup?"none":"inline-flex";
  resend.style.display=signup?"inline-flex":"inline-flex";
}
sw.onclick=()=>{signup=!signup;mode()};
mode();

async function handleRedirectSession(){
  const hash=window.location.hash||"";
  const isSignupConfirmation=hash.includes("type=signup");
  const {data}=await client.auth.getSession();

  if(data.session){
    if(isSignupConfirmation){
      showMessage("تم تأكيد الإيميل وتفعيل حسابك بنجاح. جارٍ فتح حسابك…");
      setTimeout(()=>location.href="account.html",900);
    }else{
      location.href="account.html";
    }
  }
}
handleRedirectSession();

form.onsubmit=async e=>{
  e.preventDefault();
  showMessage("جارٍ التنفيذ…");

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
    const text=r.error.message||"تعذر تنفيذ العملية.";
    if(!signup && /invalid login credentials/i.test(text)){
      showMessage("بيانات الدخول غير صحيحة. إذا نسيت كلمة المرور اضغط «نسيت كلمة المرور؟».");
    }else{
      showMessage(text);
    }
    return;
  }

  if(signup){
    if(r.data?.session){
      showMessage("تم إنشاء الحساب وتسجيل الدخول. جارٍ فتح حسابك…");
      setTimeout(()=>location.href="account.html",700);
    }else{
      showMessage("تم إنشاء الحساب. افتح رسالة تأكيد الإيميل واضغط الرابط، وراح يرجعك للموقع مباشرة.");
    }
  }else{
    location.href="account.html";
  }
};

forgot.onclick=async()=>{
  const email=document.querySelector("#email").value.trim();
  if(!email){
    showMessage("اكتب إيميلك أولاً، وبعدها اضغط «نسيت كلمة المرور؟».");
    document.querySelector("#email").focus();
    return;
  }

  showMessage("جارٍ إرسال رابط تغيير كلمة المرور…");
  const r=await client.auth.resetPasswordForEmail(email,{
    redirectTo:resetUrl
  });

  if(r.error){
    showMessage(r.error.message);
    return;
  }

  showMessage("إذا الإيميل مسجل عندنا، راح توصلك رسالة لتغيير كلمة المرور. افتح أحدث رسالة فقط.");
};

resend.onclick=async()=>{
  const email=document.querySelector("#email").value.trim();
  if(!email){
    showMessage("اكتب الإيميل أولاً.");
    document.querySelector("#email").focus();
    return;
  }

  showMessage("جارٍ إرسال رابط تأكيد جديد…");
  const r=await client.auth.resend({
    type:"signup",
    email,
    options:{emailRedirectTo:redirectUrl}
  });

  showMessage(r.error
    ?r.error.message
    :"إذا الحساب يحتاج تأكيد، راح توصلك رسالة جديدة. افتح أحدث رسالة فقط.");
};