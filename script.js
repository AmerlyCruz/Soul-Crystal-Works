const elementos = document.querySelectorAll('.fade-in');

const mostrar = () => {
  elementos.forEach(el => {
    const top = el.getBoundingClientRect().top;
    const visible = window.innerHeight - 100;

    if (top < visible) {
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }
  });
};

window.addEventListener('scroll', mostrar);
window.addEventListener('load', mostrar);

const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

const modal = document.getElementById("modal");

function abrirModal() {
  modal.style.display = "flex";
}

document.querySelector(".close").onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

function trackWhatsApp() {
  console.log("Alguien hizo clic en WhatsApp 🔥");
}