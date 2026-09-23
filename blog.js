const storageKey = 'bharatsafe_blog_posts';
const fallbackPosts = [
  { id: 'welcome', title: 'One scan can save a life', category: 'Safety', excerpt: 'Why sharing the right emergency details before you need them is one of the simplest acts of care.', content: 'Emergencies are difficult enough without having to remember every important detail. BharatSafe gives families, riders, and travellers a simple way to make critical information available when every second matters.', published: true, date: '2026-09-22' },
  { id: 'travel-ready', title: 'A calmer way to travel', category: 'Travel', excerpt: 'Small habits that help you stay ready for the unexpected, from a weekend ride to a long journey.', content: 'The best safety tools are the ones you set up before you need them. Keep your emergency contacts current, add useful medical notes, and make sure your BharatSafe tag is visible.', published: true, date: '2026-09-20' }
];

function getPosts() { return JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(fallbackPosts)); }
function formatDate(value) { return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
function renderPosts() {
  const posts = getPosts().filter((post) => post.published);
  const grid = document.querySelector('#post-grid');
  document.querySelector('#post-count').textContent = `${posts.length} ${posts.length === 1 ? 'story' : 'stories'}`;
  if (!posts.length) { grid.innerHTML = '<div class="empty-posts"><h2>Stories are on their way.</h2><p>Open the admin panel to publish the first one.</p><a class="button button-dark" href="admin.html">Write a story <span>↗</span></a></div>'; return; }
  grid.innerHTML = posts.map((post, index) => `<article class="post-card ${index === 0 ? 'featured-post' : ''}"><div class="post-art post-art-${index % 3}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${post.category}</strong></div><div class="post-meta"><span>${post.category}</span><span>${formatDate(post.date)}</span></div><h2>${post.title}</h2><p>${post.excerpt}</p><details><summary>Read story <span>↗</span></summary><div class="story-content">${post.content.split('\n').map((line) => `<p>${line}</p>`).join('')}</div></details></article>`).join('');
}
renderPosts();
