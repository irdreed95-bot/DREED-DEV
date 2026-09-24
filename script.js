const CONFIG={email:"draeddraed75@gmail.com"};
document.querySelectorAll(".year,#year").forEach(el=>{el.textContent=new Date().getFullYear();});
document.getElementById("projectForm")?.addEventListener("submit",(event)=>{
 event.preventDefault();const form=new FormData(event.currentTarget);
 const subject=encodeURIComponent("طلب مشروع جديد — DREED DEV");
 const body=encodeURIComponent("الاسم: "+form.get("name")+"\nنوع المشروع: "+form.get("type")+"\n\nالتفاصيل:\n"+form.get("message"));
 if(CONFIG.email.includes("YOUR_EMAIL")){alert("ضع بريد التواصل الحقيقي في CONFIG.email.");return;}
 window.location.href=`mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
});