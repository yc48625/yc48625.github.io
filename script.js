const canvas = document.getElementById("research-canvas");
const context = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let nodes = [];
let animationFrame = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createNodes();
}

function createNodes() {
  const count = Math.max(26, Math.floor((width * height) / 36000));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 1.8 + Math.random() * 2.8,
    angle: Math.random() * Math.PI * 2,
    speed: 0.16 + Math.random() * 0.34,
    hue: index % 3,
  }));
}

function drawNetwork() {
  context.clearRect(0, 0, width, height);

  nodes.forEach((node) => {
    node.x += Math.cos(node.angle) * node.speed;
    node.y += Math.sin(node.angle) * node.speed;

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;

    node.angle += Math.sin(Date.now() * 0.0002 + node.x * 0.01) * 0.004;
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 150) {
        const opacity = 1 - distance / 150;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgba(47, 111, 94, ${opacity * 0.17})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    const colors = ["47, 111, 94", "44, 135, 149", "217, 108, 79"];
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${colors[node.hue]}, 0.52)`;
    context.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}

function startCanvas() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();

  if (!prefersReducedMotion.matches) {
    drawNetwork();
  }
}

const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".dot"));
const progress = document.getElementById("slide-progress");
let activeSlide = 0;
let slideTimer = 0;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
  });

  progress.style.width = `${((activeSlide + 1) / slides.length) * 100}%`;
}

function queueNextSlide() {
  window.clearInterval(slideTimer);

  if (!prefersReducedMotion.matches) {
    slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 5200);
  }
}

document.getElementById("prev-slide").addEventListener("click", () => {
  showSlide(activeSlide - 1);
  queueNextSlide();
});

document.getElementById("next-slide").addEventListener("click", () => {
  showSlide(activeSlide + 1);
  queueNextSlide();
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.target));
    queueNextSlide();
  });
});

window.addEventListener("resize", resizeCanvas);
prefersReducedMotion.addEventListener("change", startCanvas);

document.getElementById("year").textContent = new Date().getFullYear();
startCanvas();
showSlide(0);
queueNextSlide();
