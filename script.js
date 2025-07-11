document.addEventListener('DOMContentLoaded', function() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById("reject-cookies");
  const cookieName = 'uk_gdpr_consent';
  const cookieValue = 'accepted';
  const cookieExpiryDays = 365;

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Strict;Secure';
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  if (cookieBanner && acceptBtn && rejectBtn) {
    if (!getCookie(cookieName)) {
      cookieBanner.style.display = 'block';
    }
    acceptBtn.addEventListener("click", function() {
      setCookie(cookieName, cookieValue, cookieExpiryDays);
      cookieBanner.style.display = "none";
    });
    rejectBtn.addEventListener("click", function() {
      setCookie(cookieName, "rejected", cookieExpiryDays);
      cookieBanner.style.display = "none";
    });
  }

  // ----- Mobile Nav Toggle -----
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('header nav');
  if (navToggle && nav) {
    // Sync class with checkbox state
    navToggle.addEventListener('change', function () {
      nav.classList.toggle('open', navToggle.checked);
      navToggle.setAttribute('aria-expanded', navToggle.checked);
    });

    // Close menu when a nav link is selected
    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.checked = false;
        nav.classList.remove('open');
      });
    });
  }

  const ctaButton = document.getElementById('cta-button');
  const ctaModal = document.getElementById('cta-modal');
  const ctaClose = document.getElementById('cta-close');
  const ctaForm = document.getElementById('cta-form');

  // ----- Logo Intro Animation -----
  const body = document.body;
  const isHome = body.classList.contains('home');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isHome && !body.classList.contains('logo-intro-done') && !reducedMotion) {
    if (localStorage.getItem('logoIntroDone') === 'true') {
      body.classList.add('logo-intro-done');
    } else {
      runLogoIntro();
    }
  }

  function runLogoIntro() {
    const headerLogo = document.querySelector('header .logo');
    if (!headerLogo) return;

    const overlay = document.createElement('div');
    overlay.id = 'logo-intro';
    overlay.setAttribute('aria-hidden', 'true');
    const clone = headerLogo.cloneNode(true);
    overlay.appendChild(clone);
    document.body.appendChild(overlay);
    body.classList.add('intro-playing');

    // Allow layout to settle before measuring
    setTimeout(() => {
      const target = headerLogo.getBoundingClientRect();
      const start = clone.getBoundingClientRect();
      const dx = target.left + target.width / 2 - (start.left + start.width / 2);
      const dy = target.top + target.height / 2 - (start.top + start.height / 2);
      const scale = target.width / start.width;

      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      overlay.style.background = 'transparent';
    }, 200); // brief pause before moving

    clone.addEventListener('transitionend', () => {
      overlay.remove();
      body.classList.remove('intro-playing');
      body.classList.add('logo-intro-done');
      localStorage.setItem('logoIntroDone', 'true');
    });
  }

  function closeModal() {
    if (ctaModal) {
      ctaModal.classList.remove('open');
      ctaModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (ctaButton && ctaModal) {
    ctaButton.addEventListener('click', function() {
      ctaModal.style.display = 'block';
      // allow layout flush before adding class for transition
      requestAnimationFrame(() => ctaModal.classList.add('open'));
      document.body.style.overflow = 'hidden';
      const firstInput = document.getElementById('cta-name');
      if (firstInput) firstInput.focus();
    });

    if (ctaClose) {
      ctaClose.addEventListener('click', closeModal);
    }

    ctaModal.addEventListener('click', function(e) {
      if (e.target === ctaModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Custom confirmation message for form submission
    if (ctaForm) {
      ctaForm.addEventListener('submit', function(e) {
        // Prevent default Netlify redirect for in-modal confirmation
        e.preventDefault();
        // Hide the form
        ctaForm.style.display = 'none';
        // Show a confirmation message
        const modalContent = ctaModal.querySelector('.modal-content');
        let confirmMsg = document.createElement('div');
        confirmMsg.className = 'cta-confirmation';
        confirmMsg.innerHTML = `
          <h2>Thank you!</h2>
          <p>Your details have been received. We’ll be in touch soon.</p>
          <button id="cta-confirm-close" class="cta-confirm-close">Close</button>
        `;
        modalContent.appendChild(confirmMsg);
        // Focus the close button for accessibility
        const closeBtn = document.getElementById('cta-confirm-close');
        if (closeBtn) {
          closeBtn.focus();
          closeBtn.addEventListener('click', function() {
            closeModal();
            // Reset form and confirmation for next open
            ctaForm.reset();
            ctaForm.style.display = '';
            confirmMsg.remove();
          });
        }
      });
    }
  }
});
