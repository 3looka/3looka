function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx    = canvas.getContext('2d');
  if (!ctx) return;

  let W, H, animId;
  let particles = [];
  let gridLines = [];
  let dataLines = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    gridLines = [];
    const spacing = 60;
    for (let x = 0; x < W; x += spacing) gridLines.push({ type: 'v', pos: x });
    for (let y = 0; y < H; y += spacing) gridLines.push({ type: 'h', pos: y });
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth   = 0.5;
    gridLines.forEach(l => {
      ctx.beginPath();
      if (l.type === 'v') { ctx.moveTo(l.pos, 0); ctx.lineTo(l.pos, H); }
      else                { ctx.moveTo(0, l.pos); ctx.lineTo(W, l.pos); }
      ctx.stroke();
    });
  }

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.5 + 0.3,
      vx:    (Math.random() - 0.5) * 0.2,
      vy:    (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.4 + 0.1,
      red:   Math.random() > 0.85,
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.red
        ? `rgba(192,57,43,${p.alpha})`
        : `rgba(232,232,232,${p.alpha})`;
      ctx.fill();
    });
  }

  function createDataLine() {
    const vertical = Math.random() > 0.5;
    return {
      vertical,
      x:       vertical ? Math.random() * W : -200,
      y:       vertical ? -200 : Math.random() * H,
      length:  Math.random() * 120 + 60,
      speed:   Math.random() * 0.6 + 0.2,
      alpha:   Math.random() * 0.15 + 0.05,
      red:     Math.random() > 0.7,
      life:    0,
      maxLife: Math.random() * 300 + 200,
    };
  }

  function initDataLines() {
    dataLines = [];
    for (let i = 0; i < 12; i++) dataLines.push(createDataLine());
  }

  function drawDataLines() {
    dataLines.forEach((l, i) => {
      l.life++;
      if (l.life > l.maxLife) dataLines[i] = createDataLine();

      const fade = l.life < 30
        ? l.life / 30
        : l.life > l.maxLife - 30
          ? (l.maxLife - l.life) / 30
          : 1;

      const color = l.red
        ? `rgba(192,57,43,${l.alpha * fade})`
        : `rgba(26,111,168,${l.alpha * fade})`;

      const grad = l.vertical
        ? ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.length)
        : ctx.createLinearGradient(l.x, l.y, l.x + l.length, l.y);

      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      if (l.vertical) {
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.length);
        l.y += l.speed;
        if (l.y > H + 200) { l.y = -200; l.x = Math.random() * W; l.life = 0; }
      } else {
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.length, l.y);
        l.x += l.speed;
        if (l.x > W + 200) { l.x = -200; l.y = Math.random() * H; l.life = 0; }
      }
      ctx.stroke();
    });
  }

  function drawGlow() {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 400);
    g.addColorStop(0, 'rgba(192,57,43,0.04)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 400, 400);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGlow();
    drawGrid();
    drawDataLines();
    drawParticles();
    animId = requestAnimationFrame(loop);
  }

  function handleVisibility() {
    cancelAnimationFrame(animId);
    if (!document.hidden) loop();
  }

  function init() {
    resize();
    initParticles();
    initDataLines();
    loop();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initParticles();
    loop();
  });
  document.addEventListener('visibilitychange', handleVisibility);

  init();
}

function initTerminal() {
  if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const ASCII = [
`__        __   _                          
\\ \\      / /__| | ___ ___  _ __ ___   ___ 
 \\ \\ /\\ / / _ \\ |/ __/ _ \\| '_ \` _ \\ / _ \\
  \\ V  V /  __/ | (_| (_) | | | | | |  __/
   \\_/\\_/ \\___|_|\\___\\___/|_| |_| |_|\\___|`,

`█░█░█ █▀▀ █░░ █▀▀ █▀█ █▀▄▀█ █▀▀
▀▄▀▄▀ ██▄ █▄▄ █▄▄ █▄█ █░▀░█ ██▄`,

`| | | | ___| | ___ ___  _ __ ___   ___ 
| | | |/ _ \\ |/ __/ _ \\| '_ \` _ \\ / _ \\
| |_| |  __/ | (_| (_) | | | | | |  __/
 \\___/ \\___|_|\\___\\___/|_| |_| |_|\\___|`
  ];

  const SEQUENCES = [
    { type: 'cmd', text: 'ali@portfolio:~$ python welcome.py' },
    { type: 'dim', text: '# Initializing welcome sequence...' },
    { type: 'dim', text: '# Loading modules...' },
    { type: 'dim', text: 'import sys, time, os' },
    { type: 'dim', text: 'from display import ascii_art, render' },
    { type: 'dim', text: '' },
    { type: 'dim', text: 'def welcome():' },
    { type: 'dim', text: '    fonts = load_fonts("JetBrains")' },
    { type: 'dim', text: '    colors = theme.get("dark-premium")' },
    { type: 'dim', text: '    art = ascii_art.generate("WELCOME")' },
    { type: 'dim', text: '    render(art, color=colors["red"])' },
    { type: 'dim', text: '' },
    { type: 'dim', text: 'welcome()' },
    { type: 'dim', text: '' },
    { type: 'dim', text: '> Compiling...' },
    { type: 'dim', text: '> Rendering output...' },
    { type: 'dim', text: '' },
    { type: 'out', text: '[ OUTPUT ]', ascii: 0 },
  ];

  let currentAscii = 0;
  let lineIndex = 0;

  function addLine(type, text) {
    const el = document.createElement('div');
    el.className = `terminal-line ${type}`;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function addAscii(index) {
    const el = document.createElement('div');
    el.className = 'terminal-line ascii';
    el.textContent = ASCII[index];
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function typeSequence() {
    if (lineIndex < SEQUENCES.length) {
      const item = SEQUENCES[lineIndex];
      addLine(item.type, item.text);
      if (item.ascii !== undefined) {
        setTimeout(() => {
          addAscii(item.ascii);
          body.scrollTop = body.scrollHeight;
        }, 300);
      }
      lineIndex++;
      const delay = item.type === 'dim' ? 120 : 300;
      setTimeout(typeSequence, delay);
    } else {
      setTimeout(() => {
        currentAscii = (currentAscii + 1) % ASCII.length;
        body.innerHTML = '';
        lineIndex = 0;
        SEQUENCES[SEQUENCES.length - 1].ascii = currentAscii;
        typeSequence();
      }, 4000);
    }
  }

  typeSequence();
}

document.addEventListener('DOMContentLoaded', initBackground);
document.addEventListener('DOMContentLoaded', initTerminal);
