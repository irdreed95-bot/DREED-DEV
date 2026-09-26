const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);

let signup=false;
let recoveryReady=false;

const form=document.querySelector("#authForm");
const recoveryForm=document.querySelector("#recoveryForm");
const msg=document.querySelector("#authMsg");
const recoveryMsg=document.querySelector("#recoveryMsg");
const name=document.querySelector("#fullName");
const nameWrap=document.querySelector("#fullNameWrap");
const title=document.querySelector("#authTitle");
const hint=document.querySelector("#authHint");
const sw=document.querySelector("#switchAuth");
const forgot=document.querySelector("#forgotPassword");
const resend=document.querySelector("#resendConfirm");
const backToLogin=document.querySelector("#backToLogin");

const siteRoot=new URL("./",window.location.href).href;
const redirectUrl=new URL("auth.html",siteRoot).href;
const normalizeEmail=value=>value.trim().toLowerCase();
const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

function showMessage(text){ msg.textContent=text; }
function showRecoveryMessage(text){ recoveryMsg.textContent=text; }

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
  resend.style.display="inline-flex";
}
sw.onclick=()=>{signup=!signup;mode()};
mode();

function showRecovery(){
  form.style.display="none";
  recoveryForm.style.display="grid";
  title.textContent="تغيير كلمة المرور";
  hint.textContent="اكتب كلمة المرور الجديدة لحسابك.";
}

function hideRecovery(){
  recoveryForm.style.display="none";
  form.style.display="grid";
  title.textContent="دخول العميل";
  hint.textContent="سجّل دخولك حتى تتابع طلباتك.";
  window.history.replaceState({},document.title,window.location.pathname+window.location.search);
  mode();
}

client.auth.onAuthStateChange((event,session)=>{
  if(event==="PASSWORD_RECOVERY" && session){
    recoveryReady=true;
    showRecovery();
    showRecoveryMessage("تم التحقق من الرابط. اكتب كلمة المرور الجديدة.");
  }
});

async function handleInitialRoute(){
  const hash=window.location.hash||"";
  const isRecovery=hash.includes("type=recovery");
  const isSignupConfirmation=hash.includes("type=signup");

  if(isRecovery){
    showRecovery();
    const {data}=await client.auth.getSession();
    if(data.session){
      recoveryReady=true;
      showRecoveryMessage("تم التحقق من الرابط. اكتب كلمة المرور الجديدة.");
    }else{
      showRecoveryMessage("جارٍ التحقق من رابط تغيير كلمة المرور…");
    }
    return;
  }

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
handleInitialRoute();

form.onsubmit=async e=>{
  e.preventDefault();
  showMessage("جارٍ التنفيذ…");

  const email=normalizeEmail(document.querySelector("#email").value);
  const password=document.querySelector("#password").value;\n  if(!validEmail(email)){showMessage("الإيميل غير صحيح. اكتب عنواناً مثل name@gmail.com");return;}\n  if(password.length<6){showMessage("كلمة المرور لازم تكون 6 أحرف أو أكثر.");return;}

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
    if(/invalid email|email address.*invalid|unable to validate email/i.test(text)){\n      showMessage("الإيميل غير صالح أو مكتوب بشكل غير صحيح. جرّب Gmail/Outlook صحيحاً مثل name@gmail.com.");\n    }else if(!signup && /invalid login credentials/i.test(text)){
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
  const email=normalizeEmail(document.querySelector("#email").value);
  if(!email){
    showMessage("اكتب إيميلك أولاً، وبعدها اضغط «نسيت كلمة المرور؟».");
    document.querySelector("#email").focus();
    return;
  }

  showMessage("جارٍ إرسال رابط تغيير كلمة المرور…");
  const r=await client.auth.resetPasswordForEmail(email,{
    redirectTo:redirectUrl
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

backToLogin.onclick=async()=>{
  await client.auth.signOut();
  recoveryReady=false;
  hideRecovery();
};

recoveryForm.onsubmit=async e=>{
  e.preventDefault();

  if(!recoveryReady){
    showRecoveryMessage("انتظر لحظة حتى يتم التحقق من رابط تغيير كلمة المرور.");
    return;
  }

  const password=document.querySelector("#newPassword").value;
  const confirm=document.querySelector("#confirmPassword").value;

  if(password.length<6){
    showRecoveryMessage("كلمة المرور لازم تكون 6 أحرف أو أكثر.");
    return;
  }

  if(password!==confirm){
    showRecoveryMessage("كلمتا المرور غير متطابقتين.");
    return;
  }

  showRecoveryMessage("جارٍ حفظ كلمة المرور…");
  const {error}=await client.auth.updateUser({password});

  if(error){
    showRecoveryMessage(error.message);
    return;
  }

  showRecoveryMessage("تم تغيير كلمة المرور بنجاح. جارٍ تحويلك لتسجيل الدخول…");
  await client.auth.signOut();
  setTimeout(()=>location.href="auth.html",900);
};