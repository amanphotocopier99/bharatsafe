/* ============================================================
   FRUIT-NINJA CURSOR — blade trail + slash on click
   ============================================================ */
(function fruitNinjaCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return; // skip on touch devices

  // --- DOM ---
  const blade = document.createElement('div');
  blade.className = 'fn-blade';

  const tip = document.createElement('div');
  tip.className = 'fn-tip';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'fn-trail-svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'fn-trail-path');
  svg.append(path);

  document.body.append(blade, svg, tip);
  document.body.classList.add('has-fn-cursor');

  // --- State ---
  const points = [];          // recent mouse positions for the trail
  const MAX_POINTS = 18;      // trail length
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let last  = { x: mouse.x, y: mouse.y };
  let velocity = 0;
  let idleTimer;
  let angle = 0;

  // --- Resize SVG to viewport ---
  function sizeSVG() {
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    svg.setAttribute('width', innerWidth);
    svg.setAttribute('height', innerHeight);
  }
  sizeSVG();
  window.addEventListener('resize', sizeSVG);

  // --- Mouse move: record points, update blade angle ---
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const dx = mouse.x - last.x;
    const dy = mouse.y - last.y;
    velocity = Math.min(Math.hypot(dx, dy), 60);
    angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // blade points along direction

    last.x = mouse.x;
    last.y = mouse.y;

    points.push({ x: mouse.x, y: mouse.y, life: 1 });
    if (points.length > MAX_POINTS) points.shift();

    // Mark as active while moving
    document.body.classList.add('fn-active');
    document.body.classList.remove('fn-idle');

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      document.body.classList.remove('fn-active');
      document.body.classList.add('fn-idle');
    }, 140);
  }, { passive: true });

  // --- Animate trail + blade ---
  function draw() {
    // Fade trail point lifetimes
    for (let i = 0; i < points.length; i++) {
      points[i].life -= 0.055;
    }
    // Drop dead points
    while (points.length && points[0].life <= 0) points.shift();

    // Build an SVG path through the live points
    if (points.length > 1) {
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      path.setAttribute('d', d);
      // Opacity scales with speed
      const op = Math.min(0.85, 0.15 + velocity / 40);
      path.style.opacity = op;
      // Thicker when faster
      path.style.strokeWidth = 1 + velocity / 20;
    } else {
      path.setAttribute('d', '');
      path.style.opacity = 0;
    }

    // Blade follows cursor with slight lag
    blade.style.transform =
      `translate3d(${mouse.x}px, ${mouse.y}px, 0) rotate(${angle}deg)`;

    // Tip follows exactly
    tip.style.transform =
      `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // --- Hover states for interactive elements ---
  document.querySelectorAll('a, button, summary, .button, .testimonial-card').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('fn-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('fn-hover'));
  });

  // --- Click: fire a slash arc ---
  window.addEventListener('mousedown', (e) => {
    const slash = document.createElement('div');
    slash.className = 'fn-slash';
    slash.style.left = e.clientX + 'px';
    slash.style.top  = e.clientY + 'px';
    slash.style.setProperty('--rot', `${(Math.random() * 90 - 45)}deg`);
    document.body.append(slash);
    setTimeout(() => slash.remove(), 520);
  });

  // --- Scroll: shrink the trail ---
  window.addEventListener('scroll', () => {
    document.body.classList.add('fn-scrolling');
    clearTimeout(window.__fnScrollTimer);
    window.__fnScrollTimer = setTimeout(() => {
      document.body.classList.remove('fn-scrolling');
    }, 120);
  }, { passive: true });
})();