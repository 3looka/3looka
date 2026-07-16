function initMain() {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── CLOCK ─────────────────────────────────────
  function updateClock() {
    const el = document.getElementById('status-time');
    if (!el) return;
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    const s   = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── FOOTER YEAR ───────────────────────────────
  const fyEl = document.getElementById('footer-year');
  if (fyEl) fyEl.textContent = new Date().getFullYear();

  // ── TYPING EFFECT ─────────────────────────────
  function typeText(el, text, speed = 40) {
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
  }

  const typingEl = document.querySelector('.typing-target');
  if (typingEl) {
    const text = typingEl.dataset.text || '';
    if (reduceMotion) typingEl.textContent = text;
    else setTimeout(() => typeText(typingEl, text), 400);
  }

  // Type the config card only on mobile while preserving its syntax colors.
  const configBlock = document.querySelector('.about-card .code-block');
  if (configBlock && window.innerWidth <= 768 && !reduceMotion) {
    const textNodes = [];
    const walker = document.createTreeWalker(configBlock, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
      textNodes.push({ node, text: node.nodeValue });
      node.nodeValue = '';
    }

    const typeConfig = () => {
      configBlock.classList.add('mobile-typing');
      let nodeIndex = 0;
      let charIndex = 0;

      const timer = setInterval(() => {
        const current = textNodes[nodeIndex];
        current.node.nodeValue += current.text[charIndex];
        charIndex++;

        if (charIndex >= current.text.length) {
          nodeIndex++;
          charIndex = 0;
        }

        if (nodeIndex >= textNodes.length) {
          clearInterval(timer);
          configBlock.classList.remove('mobile-typing');
        }
      }, 22);
    };

    const configObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        configObserver.disconnect();
        typeConfig();
      }
    }, { threshold: 0.35 });

    configObserver.observe(configBlock);
  }

  // ── COUNTER ANIMATION ─────────────────────────
  function animateCount(el, target, duration = 1500) {
    let start     = 0;
    const step    = target / (duration / 16);
    const timer   = setInterval(() => {
      start += step;
      if (start >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start);
      }
    }, 16);
  }

  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) el.textContent = target;
    else setTimeout(() => animateCount(el, target), 600);
  });

  // ── REVEAL ON SCROLL ──────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ── STACK BARS ON SCROLL ──────────────────────
  // ── ACTIVE NAV ON SCROLL ──────────────────────
  const sections = document.querySelectorAll('.module');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.dataset.section === id;
          link.classList.toggle('active', isActive);
          if (isActive) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => navObserver.observe(s));

  // ── MAGNETIC BUTTONS ──────────────────────────
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.25;
      const dy   = (e.clientY - cy) * 0.25;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });

  // ── SMOOTH SCROLL ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        history.pushState(null, '', link.getAttribute('href'));
      }
    });
  });

  // ── NAVBAR SCROLL SHADOW ──────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // ── CURSOR GLOW ───────────────────────────────
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(192,57,43,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

}
