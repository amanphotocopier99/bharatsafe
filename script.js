const typeData = {
  bike: { label: 'BIKE', title: 'SCAN TO<br />GET ME HOME' },
  car: { label: 'CAR', title: 'SCAN TO<br />REACH MY FAMILY' },
  luggage: { label: 'LUGGAGE', title: 'SCAN TO<br />SEND ME HOME' }
};

document.querySelectorAll('.selector-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.selector-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const data = typeData[button.dataset.type];
    document.querySelector('#preview-type').textContent = data.label;
    document.querySelector('#preview-title').innerHTML = data.title;
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

const testimonialTrack = document.querySelector('.testimonial-track');
const testimonialCards = document.querySelectorAll('.testimonial-card');

if (testimonialTrack && testimonialCards.length > 1) {
  let testimonialIndex = 0;
  const moveTestimonials = () => {
    testimonialIndex = (testimonialIndex + 1) % testimonialCards.length;
    testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
  };

  setInterval(moveTestimonials, 5000);
}
