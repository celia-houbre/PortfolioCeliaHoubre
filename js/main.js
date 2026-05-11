/* =============================================
   SCRIPT PRINCIPAL - Portfolio Célia
   Toutes les interactions dynamiques du site
   ============================================= */

// =============================================
// 1. HEADER : scroll + hamburger
// Ajoute la classe "scrolled" au header quand
// on descend, et gère le menu mobile
// =============================================
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Ferme le menu mobile lors d'un clic sur un lien
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// =============================================
// 2. NAVIGATION ACTIVE
// Surligne le bon lien de navigation selon
// la page actuellement visitée
// =============================================
(function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });
})();

// =============================================
// 3. ANIMATIONS FADE-UP AU SCROLL
// Observe les éléments .fade-up et leur ajoute
// .visible quand ils entrent dans le viewport
// =============================================
const fadeUpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeUpObserver.unobserve(entry.target); // Animation une seule fois
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => {
  fadeUpObserver.observe(el);
});

// =============================================
// 4. SLIDER NEWSLETTER (et générique)
// Gère les sliders de type carrousel :
// boutons précédent/suivant + points de nav
// =============================================
function initSlider(sliderContainer) {
  const track = sliderContainer.querySelector('.slider-track');
  const slides = sliderContainer.querySelectorAll('.slide');
  const dots = sliderContainer.querySelectorAll('.slider-dot');
  const btnPrev = sliderContainer.querySelector('.slider-btn.prev');
  const btnNext = sliderContainer.querySelector('.slider-btn.next');
  if (!track || slides.length === 0) return;

  let current = 0;

  function goTo(index) {
    // Boucle circulaire
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Navigation clavier (accessibilité)
  sliderContainer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Swipe tactile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });

  goTo(0); // Init
}

// Initialise tous les sliders de la page
document.querySelectorAll('.newsletter-slider').forEach(initSlider);

// =============================================
// 5. SMOOTH SCROLL POUR LES ANCRES
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // Compense le header fixe
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// =============================================
// 6. LIGHTBOX POUR LES PHOTOS
// Ouvre une photo en plein écran au clic
// =============================================
const lightbox = document.getElementById('lightbox');

if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.lightbox-close');

  // Attache le lightbox à toutes les images cliquables
  document.querySelectorAll('[data-lightbox]').forEach(trigger => {
    trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', () => {
      const src = trigger.dataset.lightbox || trigger.src;
      const alt = trigger.alt || '';
      lbImg.src = src;
      lbImg.alt = alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Fermeture : bouton, clic fond, Escape
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
}

// =============================================
// 7. ANIMATION COMPTEURS (section home)
// Anime les chiffres dans les stats de la carte
// =============================================
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  if (isNaN(target)) return;
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();
  const suffix = el.dataset.suffix || '';

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(start + (target - start) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Lance les compteurs quand ils deviennent visibles
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// =============================================
// 8. PLANTES DÉCORATIVES : parallaxe léger
// Applique un léger décalage vertical au scroll
// pour un effet de profondeur
// =============================================
const plants = document.querySelectorAll('.plant-decor, .hero-decor');
if (plants.length > 0) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    plants.forEach((plant, i) => {
      const factor = i % 2 === 0 ? 0.08 : 0.05;
      plant.style.transform = `translateY(${y * factor}px)`;
    });
  }, { passive: true });
}

// =============================================
// 9. LOGO → retour accueil
// =============================================
const logoEl = document.querySelector('.logo');
if (logoEl) {
  logoEl.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}
