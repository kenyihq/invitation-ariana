// ==========================================
// 1. Animaciones de aparición al desplazarse
// ==========================================

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  },
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

// ==========================================
// 2. Música de fondo con entrada gradual
// ==========================================

const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");
const musicText = document.getElementById("musicText");
const musicIcon = document.getElementById("musicIcon");

let musicPlaying = false;
let fadeInterval = null;

function updateMusicButton(playing) {
  musicPlaying = playing;

  if (playing) {
    musicText.textContent = "Pausar música";
    musicIcon.textContent = "Ⅱ";
    musicButton.setAttribute("aria-label", "Pausar música");
  } else {
    musicText.textContent = "Activar música";
    musicIcon.textContent = "♫";
    musicButton.setAttribute("aria-label", "Activar música");
  }
}

function fadeMusicIn() {
  clearInterval(fadeInterval);

  music.volume = 0;

  let volume = 0;

  fadeInterval = setInterval(() => {
    volume = Math.min(volume + 0.025, 0.35);
    music.volume = volume;

    if (volume >= 0.35) {
      clearInterval(fadeInterval);
    }
  }, 180);
}

async function startMusic() {
  if (musicPlaying) return;

  try {
    await music.play();

    updateMusicButton(true);
    fadeMusicIn();
  } catch (error) {
    // El navegador puede bloquear el inicio automático.
    // El invitado puede activar la música con el botón.
    console.info("El navegador requiere activar la música manualmente.");
    musicText.textContent = "Activar música";
  }
}

function pauseMusic() {
  clearInterval(fadeInterval);
  music.pause();
  updateMusicButton(false);
}

musicButton.addEventListener("click", async () => {
  if (musicPlaying) {
    pauseMusic();
  } else {
    await startMusic();
  }
});

// ==========================================
// 3. Lluvia de estrellas doradas
// ==========================================

const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let stars = [];
let starsStarted = false;
let animationFrame = null;

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  canvas.width = canvasWidth * pixelRatio;
  canvas.height = canvasHeight * pixelRatio;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createStar(initialPosition = false) {
  return {
    x: Math.random() * canvasWidth,
    y: initialPosition ? Math.random() * canvasHeight : -15,

    size: Math.random() * 2.1 + 1,
    speed: Math.random() * 0.9 + 0.45,
    drift: (Math.random() - 0.5) * 0.45,

    opacity: Math.random() * 0.4 + 0.45,
    twinkle: Math.random() * 0.035 + 0.008,
    phase: Math.random() * Math.PI * 2,
  };
}

function initializeStars() {
  const starCount = Math.min(95, Math.max(45, Math.floor(canvasWidth / 8)));

  stars = Array.from({ length: starCount }, () => createStar(true));
}

function drawStar(star) {
  star.phase += star.twinkle;

  const shimmer = 0.65 + Math.sin(star.phase) * 0.35;
  const alpha = star.opacity * shimmer;

  ctx.save();
  ctx.translate(star.x, star.y);

  // Halo luminoso sutil
  ctx.beginPath();
  ctx.arc(0, 0, star.size * 2.8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(225, 197, 135, ${alpha * 0.16})`;
  ctx.fill();

  // Estrella de cuatro puntas
  ctx.beginPath();
  ctx.moveTo(0, -star.size * 2.5);
  ctx.lineTo(star.size * 0.45, -star.size * 0.45);
  ctx.lineTo(star.size * 2.5, 0);
  ctx.lineTo(star.size * 0.45, star.size * 0.45);
  ctx.lineTo(0, star.size * 2.5);
  ctx.lineTo(-star.size * 0.45, star.size * 0.45);
  ctx.lineTo(-star.size * 2.5, 0);
  ctx.lineTo(-star.size * 0.45, -star.size * 0.45);
  ctx.closePath();

  ctx.fillStyle = `rgba(204, 164, 91, ${alpha})`;
  ctx.shadowColor = "rgba(225, 197, 135, 0.8)";
  ctx.shadowBlur = 8;
  ctx.fill();

  ctx.restore();
}

function animateStars() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  stars.forEach((star, index) => {
    star.y += star.speed;
    star.x += star.drift;

    drawStar(star);

    if (star.y > canvasHeight + 15) {
      stars[index] = createStar(false);
    }
  });

  animationFrame = requestAnimationFrame(animateStars);
}

function startMagic() {
  if (starsStarted || reduceMotion) return;

  starsStarted = true;

  resizeCanvas();
  initializeStars();

  canvas.classList.add("stars-active");

  animateStars();

  // Intenta iniciar la música tras el primer desplazamiento.
  startMusic();

  window.removeEventListener("scroll", startMagic);
  window.removeEventListener("touchmove", startMagic);
  window.removeEventListener("wheel", startMagic);
}

// La lluvia comienza con el primer scroll, gesto táctil o rueda del mouse.
window.addEventListener("scroll", startMagic, { passive: true });
window.addEventListener("touchmove", startMagic, { passive: true });
window.addEventListener("wheel", startMagic, { passive: true });

window.addEventListener("resize", () => {
  resizeCanvas();

  if (starsStarted) {
    initializeStars();
  }
});

resizeCanvas();
