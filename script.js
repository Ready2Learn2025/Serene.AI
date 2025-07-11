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
  const chatbot = document.getElementById('chatbot');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotClose = document.getElementById('chatbot-close');

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

  function closeChat() {
    if (chatbot) {
      chatbot.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = sender === 'bot' ? 'text-left' : 'text-right';
    msg.innerHTML = `<span class="inline-block px-3 py-2 rounded-lg ${sender === 'bot' ? 'bg-gray-100' : 'bg-teal-600 text-white'}">${text}</span>`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  const questions = [
    { name: 'name', text: 'What is your name?' },
    { name: 'email', text: 'What is your email?' },
    { name: 'company', text: 'Company name?' },
    { name: 'company_size', text: 'Company size?' },
    { name: 'website', text: 'Link to your website?' },
    { name: 'problem', text: 'What problem are you trying to solve?' },
    { name: 'success', text: 'What does success look like?' }
  ];

  let qIndex = 0;

  function askQuestion() {
    if (qIndex < questions.length) {
      const q = questions[qIndex];
      const typing = document.createElement('div');
      typing.className = 'text-left text-gray-400 italic';
      typing.textContent = '...';
      chatbotMessages.appendChild(typing);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      setTimeout(() => {
        typing.remove();
        addMessage(q.text, 'bot');
      }, 400);
    } else {
      addMessage('Thanks! We\'ll be in touch soon.', 'bot');
      if (ctaForm) {
        ctaForm.submit();
      }
    }
  }

  if (chatbotForm) {
    chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const val = chatbotInput.value.trim();
      if (!val) return;
      addMessage(val, 'user');
      const q = questions[qIndex];
      const field = ctaForm ? ctaForm.querySelector(`[name="${q.name}"]`) : null;
      if (field) field.value = val;
      chatbotInput.value = '';
      qIndex++;
      askQuestion();
    });
  }

  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      if (chatbot) {
        chatbotMessages.innerHTML = '';
        qIndex = 0;
        chatbot.classList.remove('hidden');
        askQuestion();
      }
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', closeChat);
  }
});
