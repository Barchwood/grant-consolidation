const opportunities = {
  business: { label: 'business', question: 'What kind of business are you funding?', placeholder: 'Example: expanding my catering business', result: 'We found business grants, loans, and incentives that fit your goals.' },
  school: { label: 'education', question: 'What are you working toward?', placeholder: 'Example: nursing degree and first-generation student', result: 'We found scholarships and student aid that fit your path.' },
  personal: { label: 'life', question: 'What would you like help with?', placeholder: 'Example: rent support while I train for a new career', result: 'We found assistance programs aligned with your next step.' }
};

const modal = document.querySelector('#modal');
const formArea = document.querySelector('#formArea');
const toast = document.querySelector('#toast');
const count = document.querySelector('.saved-count');
let saved = 0;

function openModal(path = '') {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  if (path) selectPath(path);
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
function selectPath(path) {
  const data = opportunities[path];
  document.querySelector('#modalTitle').textContent = data.question;
  document.querySelector('#modalDescription').textContent = 'Share a little context and we’ll create your first set of matches.';
  formArea.innerHTML = `<label for="storyInput">A few words about your goal</label><input id="storyInput" placeholder="${data.placeholder}" /><button class="button button-primary" id="matchButton">Show my matches →</button>`;
  document.querySelector('#matchButton').addEventListener('click', () => {
    const input = document.querySelector('#storyInput');
    if (!input.value.trim()) { input.focus(); input.style.borderColor = '#c17d56'; return; }
    closeModal();
    showToast(data.result);
    document.querySelector('#saved').scrollIntoView({ behavior: 'smooth' });
  });
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 4500);
}

document.querySelector('#startButton').addEventListener('click', () => openModal());
document.querySelector('#closeModal').addEventListener('click', closeModal);
document.querySelector('#signInButton').addEventListener('click', () => showToast('Sign in is coming soon — your matches are available without an account.'));
document.querySelector('#previewButton').addEventListener('click', () => {
  saved += 1;
  count.textContent = saved;
  showToast('Dashboard preview saved to your matches.');
});
document.querySelectorAll('[data-path]').forEach((button) => button.addEventListener('click', () => openModal(button.dataset.path)));
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
