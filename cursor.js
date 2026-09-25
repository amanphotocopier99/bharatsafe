const cursorDot = document.createElement('div');
const cursorRing = document.createElement('div');
const cursorLabel = document.createElement('span');

cursorDot.className = 'cursor-dot';
cursorRing.className = 'cursor-ring';
cursorLabel.className = 'cursor-label';
cursorLabel.textContent = 'SCROLL';
cursorRing.append(cursorLabel);
document.body.append(cursorDot, cursorRing);

document.body.classList.add('has-custom-cursor');
window.addEventListener('mousemove', (event) => {
  cursorDot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  cursorRing.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  document.body.classList.add('cursor-ready');
});
document.querySelectorAll('a, button, summary').forEach((element) => {
  element.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
let scrollTimer;
window.addEventListener('scroll', () => {
  document.body.classList.add('cursor-scrolling');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => document.body.classList.remove('cursor-scrolling'), 120);
}, { passive: true });
