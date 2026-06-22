const { reasons } = JSON.parse(decodeURIComponent(escape(atob(REASONS_DATA))));
const reasonById = new Map(reasons.map(r => [r.id, r]));
const found = getFound();

const bodyEl = document.getElementById('letter-body');

function renderParagraph(raw) {
    const p = document.createElement('p');
    const tipPattern = /<tip id="(\d+)"\s*\/>/g;

    let lastIndex = 0;
    let match;

    while ((match = tipPattern.exec(raw)) !== null) {
        const [full, idStr] = match;
        const id = parseInt(idStr, 10);

        if (match.index > lastIndex) {
            p.appendChild(document.createTextNode(raw.slice(lastIndex, match.index)));
        }

        const span = document.createElement('span');
        span.className = 'tip';

        if (found.has(id)) {
            const reason = reasonById.get(id);
            span.textContent = reason ? reason.title : '???';
            span.classList.add('found');
        } else {
            span.textContent = TIPS[id] || '...';
        }

        p.appendChild(span);
        lastIndex = match.index + full.length;
    }

    if (lastIndex < raw.length) {
        p.appendChild(document.createTextNode(raw.slice(lastIndex)));
    }

    return p;
}

LETTER.paragraphs.forEach(raw => {
    bodyEl.appendChild(renderParagraph(raw));
});
