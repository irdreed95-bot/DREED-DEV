const CONFIG = {
  email: "YOUR_EMAIL@example.com",
};

const menuButton = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("projectForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subject = encodeURIComponent("طلب مشروع جديد — DREED DEV");
  const body = encodeURIComponent(
    "الاسم: " + form.get("name") +
    "\nنوع المشروع: " + form.get("type") +
    "\n\nالتفاصيل:\n" + form.get("message")
  );

  if (CONFIG.email.includes("YOUR_EMAIL")) {
    alert("قبل النشر: افتح script.js وضع بريدك الحقيقي مكان YOUR_EMAIL@example.com.");
    return;
  }

  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
});
