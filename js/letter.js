const { reasons } = JSON.parse(decodeURIComponent(escape(atob(REASONS_DATA))));
const reasonById = new Map(reasons.map(r => [r.id, r]));

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

        const reason = reasonById.get(id);
        const span = document.createElement('span');
        span.className = 'tip';
        span.textContent = reason && reason.hint ? reason.hint : '???';
        p.appendChild(span);

        lastIndex = match.index + full.length;
    }

    if (lastIndex < raw.length) {
        p.appendChild(document.createTextNode(raw.slice(lastIndex)));
    }

    return p;
}

fetch('letter.json')
    .then(r => r.json())
    .then(letter => {
        letter.paragraphs.forEach(raw => {
            bodyEl.appendChild(renderParagraph(raw));
        });
    });
