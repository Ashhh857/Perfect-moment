(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  };

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeNav(); });

  const lightbox = document.querySelector('#lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('figcaption');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('[data-lightbox-gallery] .gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      lastFocused = item;
      lightboxImg.src = item.dataset.full || item.querySelector('img')?.src || '';
      lightboxImg.alt = item.querySelector('img')?.alt || '';
      if (lightboxCaption) lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.hidden = false;
      document.body.classList.add('no-scroll');
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox(); });
})();
