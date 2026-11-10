// Filter the statically generated template cards. No database or network calls.
(() => {
  const cards = [...document.querySelectorAll('.store-listing')];
  const search = document.getElementById('store-search');
  const niche = document.getElementById('store-niche');
  const group = document.querySelector('.store-tier-filter');
  const results = document.getElementById('store-filter-results');
  if (!cards.length || !search || !niche || !group || !results) return;
  let tier = 'all';
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const tierMatch = tier === 'all' || (tier === 'preview' ? card.dataset.tier !== 'free' : card.dataset.tier === tier);
      const nicheMatch = niche.value === 'all' || card.dataset.niche === niche.value;
      const searchMatch = !query || (card.dataset.search || '').includes(query);
      const shown = tierMatch && nicheMatch && searchMatch;
      card.hidden = !shown;
      if (shown) visible++;
    }
    results.textContent = `${visible} template${visible === 1 ? '' : 's'} match${visible === 1 ? 'es' : ''} your filters`;
  };
  search.addEventListener('input', update);
  niche.addEventListener('change', update);
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tier-filter]');
    if (!button || !group.contains(button)) return;
    tier = button.dataset.tierFilter;
    for (const btn of group.querySelectorAll('button')) btn.setAttribute('aria-pressed', String(btn === button));
    update();
  });
  update();
})();
