const opportunities = {
  business: { question: 'What kind of business are you funding?', placeholder: 'Example: expanding my catering business', fields: [{ name: 'EIN (optional)', id: 'ein', placeholder: 'Do not enter an SSN' }, { name: 'Business goal', id: 'story', placeholder: 'Example: equipment and hiring' }] },
  school: { question: 'What are you working toward?', placeholder: 'Example: nursing degree and first-generation student', fields: [{ name: 'ZIP code', id: 'zip', placeholder: 'Your ZIP code' }, { name: 'School, major, GPA, and activities', id: 'story', placeholder: 'Example: nursing, 3.4 GPA, volunteer coach' }] },
  personal: { question: 'What would you like help with?', placeholder: 'Example: rent support while I train for a new career', fields: [{ name: 'Your situation and goal', id: 'story', placeholder: 'Describe what is happening and what you want to accomplish' }] }
};
const modal = document.querySelector('#modal'); const formArea = document.querySelector('#formArea'); const toast = document.querySelector('#toast'); const count = document.querySelector('.saved-count');
let saved = JSON.parse(localStorage.getItem('fundmatch-saved') || '[]'); count.textContent = saved.length;
function showToast(message) { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 4500); }
function openModal(path = '') { modal.hidden = false; document.body.style.overflow = 'hidden'; document.querySelector('#closeModal').focus(); if (path) selectPath(path); }
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; document.querySelector('#startButton').focus(); }
function selectPath(path) {
  const data = opportunities[path]; document.querySelector('#modalTitle').textContent = data.question; document.querySelector('#modalDescription').textContent = 'Share only what you are comfortable sharing. Sensitive data is not required for this prototype.';
  formArea.innerHTML = data.fields.map(field => `<label for="${field.id}">${field.name}</label><input id="${field.id}" placeholder="${field.placeholder}" autocomplete="off" />`).join('') + '<button class="button button-primary" id="matchButton">Show my matches →</button><div id="results" class="results" aria-live="polite"></div>';
  document.querySelector('#matchButton').addEventListener('click', () => search(path));
  document.querySelector(`#${data.fields[0].id}`).focus();
}
async function search(path) {
  const data = opportunities[path]; const params = new URLSearchParams({ path, query: data.fields.map(field => document.querySelector(`#${field.id}`).value.trim()).filter(Boolean).join(' ') });
  const results = document.querySelector('#results'); const button = document.querySelector('#matchButton'); button.disabled = true; button.textContent = 'Searching verified sources…'; results.textContent = '';
  try {
    const response = await fetch(`/api/opportunities?${params}`); if (!response.ok) throw new Error('Search service unavailable'); const payload = await response.json();
    results.innerHTML = `<p class="results-notice">${payload.notice}</p>`;
    payload.results.forEach(item => {
      const card = document.createElement('article'); card.className = 'result-card';
      card.innerHTML = `<div><strong></strong><small></small><p></p></div><button class="save-result" type="button">Save</button>`;
      card.querySelector('strong').textContent = item.title; card.querySelector('small').textContent = `${item.type} · ${item.amount} · ${item.deadline} · ${item.provider}`; card.querySelector('p').textContent = item.description;
      const save = card.querySelector('.save-result'); save.addEventListener('click', () => { if (!saved.some(savedItem => savedItem.id === item.id)) { saved.push(item); localStorage.setItem('fundmatch-saved', JSON.stringify(saved)); count.textContent = saved.length; save.textContent = 'Saved'; showToast('Opportunity saved to this device.'); } }); results.appendChild(card);
    });
  } catch (error) { results.textContent = 'We could not reach the search service. Please try again.'; }
  button.disabled = false; button.textContent = 'Search again →';
}
document.querySelector('#startButton').addEventListener('click', () => openModal()); document.querySelector('#closeModal').addEventListener('click', closeModal);
document.querySelector('#signInButton').addEventListener('click', () => showToast('Accounts are not enabled yet; saved matches are stored on this device.'));
document.querySelector('#previewButton').addEventListener('click', () => document.querySelector('#saved').scrollIntoView({ behavior: 'smooth' }));
document.querySelectorAll('[data-path]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.path)));
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); }); document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
