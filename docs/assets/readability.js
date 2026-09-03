(() => {
  const app = document.getElementById('app');
  if (!app) return;
  const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  function sentences(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(x => x.trim()).filter(Boolean) || [];
  }

  function shortLead(text) {
    const parts = sentences(text);
    if (!parts.length) return text;
    const selected = [];
    let words = 0;
    for (const sentence of parts) {
      const count = sentence.split(/\s+/).length;
      if (selected.length && words + count > 42) break;
      selected.push(sentence);
      words += count;
      if (selected.length >= 2) break;
    }
    return selected.join(' ');
  }

  function splitDenseParagraph(paragraph) {
    if (paragraph.dataset.readabilitySplit) return;
    paragraph.dataset.readabilitySplit = 'true';
    const text = paragraph.textContent.trim();
    const parts = sentences(text);
    if (text.length < 330 || parts.length < 3) return;

    const groups = [];
    let group = [];
    let words = 0;
    for (const sentence of parts) {
      const count = sentence.split(/\s+/).length;
      if (group.length && (words + count > 46 || group.length >= 2)) {
        groups.push(group.join(' '));
        group = [];
        words = 0;
      }
      group.push(sentence);
      words += count;
    }
    if (group.length) groups.push(group.join(' '));
    if (groups.length < 2) return;

    const fragment = document.createDocumentFragment();
    groups.forEach(textPart => {
      const node = document.createElement('p');
      node.textContent = textPart;
      node.dataset.readabilitySplit = 'true';
      fragment.appendChild(node);
    });
    paragraph.replaceWith(fragment);
  }

  function replaceGenericPlain(card) {
    const plain = card.querySelector('.plain-history p');
    if (!plain || !plain.textContent.trim().startsWith('Nesta aula, a meta é entender')) return;
    const opening = card.querySelector('.lesson-opening p') || card.querySelector('.lesson-body > p');
    if (!opening) return;
    const lead = shortLead(opening.textContent);
    if (lead.length >= 55) plain.textContent = lead;
  }

  function simplifyLabels(card) {
    const concepts = card.querySelector('.concepts > strong');
    if (concepts) concepts.textContent = 'Palavras e ideias importantes';
    card.querySelectorAll('.lesson-section h3').forEach(title => {
      if (title.textContent.trim() === 'Perguntas para pensar') title.textContent = 'Confira se você entendeu';
    });
  }

  function decorate() {
    if (route()[0] !== 'course') return;
    document.querySelectorAll('.lesson-card').forEach(card => {
      replaceGenericPlain(card);
      simplifyLabels(card);
      card.querySelectorAll('.lesson-opening p, .lesson-explanation > p, .history-depth-body > p, .reading-callout > p').forEach(splitDenseParagraph);
    });
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  };

  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  schedule();
})();
