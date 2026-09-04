const countdownScreen = document.querySelector("#countdownScreen");
const countdownNumber = document.querySelector("#countdownNumber");
const countdownName = document.querySelector("#countdownName");
const bowScreen = document.querySelector("#bowScreen");
const roseReveal = document.querySelector("#roseReveal");
const mainContent = document.querySelector("#mainContent");
const arrowControl = document.querySelector("#arrowControl");
const bowString = document.querySelector("#bowString");
const targetHeart = document.querySelector("#targetHeart");
const bowHint = document.querySelector("#bowHint");
const skipIntro = document.querySelector("#skipIntro");
const replayButton = document.querySelector("#replayButton");
const heartTrail = document.querySelector("#heartTrail");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let countdownValue = 3;
let countdownTimer;
let dragging = false;
let startX = 0;
let pullDistance = 0;
let introFinished = false;

function restartNumberAnimation() {
  countdownNumber.style.animation = "none";
  void countdownNumber.getBoundingClientRect();
  countdownNumber.style.animation = "";
}

function beginCountdown() {
  clearInterval(countdownTimer);
  introFinished = false;
  countdownValue = 3;
  countdownNumber.textContent = "3";
  countdownName.classList.remove("visible");
  countdownScreen.hidden = false;
  bowScreen.hidden = true;
  roseReveal.hidden = true;
  mainContent.hidden = true;
  document.body.classList.add("intro-active");
  window.scrollTo({ top: 0, behavior: "instant" });

  if (reducedMotion) {
    countdownName.classList.add("visible");
    setTimeout(showBow, 450);
    return;
  }

  countdownTimer = setInterval(() => {
    countdownValue -= 1;
    if (countdownValue > 0) {
      countdownNumber.textContent = String(countdownValue);
      restartNumberAnimation();
      return;
    }

    clearInterval(countdownTimer);
    countdownNumber.textContent = "♥";
    countdownName.classList.add("visible");
    restartNumberAnimation();
    setTimeout(showBow, 850);
  }, 900);
}

function showBow() {
  countdownScreen.hidden = true;
  bowScreen.hidden = false;
  arrowControl.focus({ preventScroll: true });
}

function setArrowPull(distance) {
  pullDistance = Math.max(0, Math.min(64, distance));
  arrowControl.style.transform = `translateX(${-pullDistance}px)`;
  bowString.setAttribute("points", `92,28 ${92 - pullDistance},110 92,192`);
}

function startDrag(event) {
  if (introFinished) return;
  dragging = true;
  startX = event.clientX;
  arrowControl.classList.add("dragging");
  arrowControl.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function moveDrag(event) {
  if (!dragging) return;
  setArrowPull(startX - event.clientX);
  bowHint.textContent = pullDistance > 40 ? "Now release it…" : "Keep pulling gently…";
  event.preventDefault();
}

function endDrag(event) {
  if (!dragging) return;
  dragging = false;
  arrowControl.classList.remove("dragging");
  arrowControl.releasePointerCapture?.(event.pointerId);

  if (pullDistance >= 36) {
    shootArrow();
  } else {
    arrowControl.style.transition = "transform .35s ease";
    setArrowPull(0);
    bowHint.textContent = "Pull a little farther and release";
    setTimeout(() => {
      arrowControl.style.transition = "";
    }, 360);
  }
}

function shootArrow() {
  if (introFinished) return;
  introFinished = true;
  startDirectMusic();
  bowHint.textContent = "Straight from my heart to yours…";
  bowString.setAttribute("points", "92,28 92,110 92,192");
  arrowControl.style.transform = "";
  arrowControl.classList.add("shot");

  setTimeout(() => {
    targetHeart.classList.add("hit");
    burstHearts(window.innerWidth * 0.78, window.innerHeight * 0.48, 16);
  }, reducedMotion ? 20 : 520);

  setTimeout(showRose, reducedMotion ? 100 : 980);
}

function showRose() {
  bowScreen.hidden = true;
  roseReveal.hidden = false;
  setTimeout(showMain, reducedMotion ? 300 : 2050);
}

function showMain() {
  roseReveal.hidden = true;
  mainContent.hidden = false;
  document.body.classList.remove("intro-active");
  requestAnimationFrame(() => {
    document.querySelector(".hero-content")?.classList.add("visible");
  });
}

arrowControl.addEventListener("pointerdown", startDrag);
window.addEventListener("pointermove", moveDrag, { passive: false });
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);
arrowControl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setArrowPull(56);
    setTimeout(shootArrow, reducedMotion ? 20 : 260);
  }
});

skipIntro.addEventListener("click", () => {
  startDirectMusic();
  showMain();
});
replayButton.addEventListener("click", () => {
  arrowControl.classList.remove("shot");
  targetHeart.classList.remove("hit");
  arrowControl.style.transform = "";
  bowString.setAttribute("points", "92,28 92,110 92,192");
  bowHint.textContent = "Pull the arrow back and release it";
  setArrowPull(0);
  beginCountdown();
});

function createHeart(x, y, size = 18, symbol = "♥") {
  const heart = document.createElement("span");
  heart.className = "trail-heart";
  heart.textContent = symbol;
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = `${size}px`;
  heart.style.color = Math.random() > 0.5 ? "#ff8ec3" : "#ffd3e7";
  heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 50}px`);
  heartTrail.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
  setTimeout(() => heart.remove(), 1200);
}

let lastHeartAt = 0;
window.addEventListener("pointermove", (event) => {
  if (dragging || reducedMotion) return;
  const now = performance.now();
  if (now - lastHeartAt < 72) return;
  lastHeartAt = now;
  createHeart(event.clientX, event.clientY, 13 + Math.random() * 8);
});

window.addEventListener("pointerdown", (event) => {
  if (event.target.closest("#arrowControl")) return;
  createHeart(event.clientX, event.clientY, 22, "❤");
});

function burstHearts(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    setTimeout(() => {
      createHeart(x + (Math.random() - 0.5) * 150, y + (Math.random() - 0.5) * 100, 14 + Math.random() * 18);
    }, i * 32);
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px" }
);

document.querySelectorAll(".reveal-on-scroll").forEach((element) => observer.observe(element));

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightbox = document.querySelector("#closeLightbox");

document.querySelectorAll("[data-full]").forEach((button) => {
  button.addEventListener("click", () => {
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = button.querySelector("img")?.alt || "Expanded memory";
    lightbox.showModal();
  });
});

closeLightbox.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const musicButton = document.querySelector("#musicButton");
const musicLabel = document.querySelector("#musicLabel");
const musicStatus = document.querySelector("#musicStatus");
const loveSong = document.querySelector("#loveSong");
const SONG_START_TIME = 6;
const TARGET_VOLUME = 0.68;
let songHasStarted = false;
let fadeTimer;

function cueSongAtSixSeconds() {
  if (!songHasStarted || loveSong.ended || loveSong.currentTime < SONG_START_TIME) {
    try {
      loveSong.currentTime = SONG_START_TIME;
    } catch {
      // The loadedmetadata handler below completes the seek on slower connections.
    }
  }
}

function fadeSongIn() {
  clearInterval(fadeTimer);
  loveSong.volume = Math.min(loveSong.volume, 0.08);
  fadeTimer = setInterval(() => {
    loveSong.volume = Math.min(TARGET_VOLUME, loveSong.volume + 0.055);
    if (loveSong.volume >= TARGET_VOLUME) clearInterval(fadeTimer);
  }, 85);
}

function setMusicUi(playing) {
  musicButton.classList.toggle("playing", playing);
  musicButton.setAttribute("aria-pressed", String(playing));
  musicLabel.textContent = playing ? "Pause Cinnamon Girl" : "Play Cinnamon Girl";
  musicStatus.textContent = playing ? "Cinnamon Girl is playing from six seconds." : "Music paused.";
}

function startDirectMusic() {
  cueSongAtSixSeconds();
  loveSong.volume = 0.03;
  const playAttempt = loveSong.play();

  if (playAttempt) {
    playAttempt
      .then(() => {
        songHasStarted = true;
        fadeSongIn();
        setMusicUi(true);
      })
      .catch(() => {
        setMusicUi(false);
        musicLabel.textContent = "Tap for Cinnamon Girl";
        musicStatus.textContent = "Tap the music button to begin the song.";
      });
  }
}

function pauseDirectMusic() {
  clearInterval(fadeTimer);
  loveSong.pause();
  setMusicUi(false);
}

loveSong.addEventListener("loadedmetadata", () => {
  if (!songHasStarted || loveSong.currentTime < SONG_START_TIME) {
    loveSong.currentTime = SONG_START_TIME;
  }
});

loveSong.addEventListener("ended", () => {
  loveSong.currentTime = SONG_START_TIME;
  startDirectMusic();
});

loveSong.addEventListener("pause", () => {
  if (!loveSong.ended) setMusicUi(false);
});

musicButton.addEventListener("click", () => {
  if (loveSong.paused) startDirectMusic();
  else pauseDirectMusic();
});

beginCountdown();
