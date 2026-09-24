const navClient=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);

const navLinks=document.querySelector(".nav-links");
const menuButton=document.querySelector(".menu-btn");

function closeNav(){
  navLinks?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded","false");
}

menuButton?.addEventListener("click",()=>{
  const open=navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded",String(open));
});

function addNavLink({key,href,textContent,afterClass=""}){
  if(!navLinks) return null;
  let el=navLinks.querySelector(`[data-nav-${key}]`);
  if(!el){
    el=document.createElement("a");
    el.href=href;
    el.dataset[`nav${key.charAt(0).toUpperCase()+key.slice(1)}`]="";
    el.textContent=textContent;
    if(afterClass) el.className=afterClass;
    navLinks.appendChild(el);
  }
  return el;
}

function markActive(el,href){
  if(!el) return;
  try{
    const current=new URL(location.href);
    const target=new URL(href,current.href);
    el.classList.toggle("active",current.pathname===target.pathname);
  }catch{}
}

(async()=>{
  if(!navLinks) return;

  const account=addNavLink({key:"account",href:"account.html",textContent:"الحساب"});
  const profile=addNavLink({key:"profile",href:"profile.html",textContent:"الملف الشخصي"});
  const admin=addNavLink({key:"admin",href:"admin.html",textContent:"لوحة التحكم"});
  const logout=addNavLink({key:"logout",href:"#",textContent:"خروج"});

  [account,profile,admin,logout].forEach(el=>el?.addEventListener("click",closeNav));

  markActive(account,"account.html");
  markActive(profile,"profile.html");
  markActive(admin,"admin.html");

  const {data:{session}}=await navClient.auth.getSession();
  const user=session?.user;

  if(!user){
    [account,profile,admin,logout].forEach(el=>{if(el) el.style.display="none";});
    return;
  }

  if(account) account.style.display="inline-flex";
  if(profile) profile.style.display="inline-flex";
  if(logout) logout.style.display="inline-flex";

  const p=await navClient.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
  if(admin) admin.style.display=p.data?.is_admin?"inline-flex":"none";

  if(logout){
    logout.onclick=async e=>{
      e.preventDefault();
      logout.setAttribute("aria-busy","true");
      await navClient.auth.signOut();
      location.href="index.html";
    };
  }
})();