const navClient=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const navLinks=document.querySelector(".nav-links");
const menuButton=document.querySelector(".menu-btn");
function closeNav(){navLinks?.classList.remove("open");menuButton?.setAttribute("aria-expanded","false");}
menuButton?.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});
navLinks?.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeNav));
(async()=>{
 const {data:{user}}=await navClient.auth.getUser();
 if(!navLinks)return;
 let account=navLinks.querySelector("[data-nav-account]"),admin=navLinks.querySelector("[data-nav-admin]"),logout=navLinks.querySelector("[data-nav-logout]");
 if(!account){account=document.createElement("a");account.href="account.html";account.dataset.navAccount="";account.textContent="الحساب";navLinks.appendChild(account);}
 if(!admin){admin=document.createElement("a");admin.href="admin.html";admin.dataset.navAdmin="";admin.textContent="لوحة التحكم";navLinks.appendChild(admin);}
 if(!logout){logout=document.createElement("a");logout.href="#";logout.dataset.navLogout="";logout.textContent="خروج";navLinks.appendChild(logout);}
 if(!user){account.style.display="none";admin.style.display="none";logout.style.display="none";return;}
 account.style.display="inline-flex";logout.style.display="inline-flex";
 const p=await navClient.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
 admin.style.display=p.data?.is_admin?"inline-flex":"none";
 logout.onclick=async e=>{e.preventDefault();await navClient.auth.signOut();location.href="index.html";};
})();