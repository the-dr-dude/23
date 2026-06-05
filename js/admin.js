const ADMIN_PASS = 'changeme';

if (prompt('Password') !== ADMIN_PASS) {
    location.replace('index.html');
}

const { reasons } = JSON.parse(atob(REASONS_DATA));

document.addEventListener('DOMContentLoaded', () => {
    const found = getFound();
    const list = document.getElementById('entries');
    const sorted = [...reasons].sort((a, b) => a.frequency - b.frequency);

    for (const r of sorted) {
        const isFound = found.has(r.id);
        const li = document.createElement('li');
        li.className = isFound ? 'found' : 'unfound';

        const f = document.createElement('div');
        f.className = 'freq';
        f.textContent = r.frequency.toFixed(1) + ' MHz' + (isFound ? '  found' : '');

        const ttl = document.createElement('div');
        ttl.className = 'title';
        ttl.textContent = r.title;

        const t = document.createElement('div');
        t.className = 'text';
        t.textContent = r.text;

        li.appendChild(f);
        li.appendChild(ttl);
        li.appendChild(t);
        list.appendChild(li);
    }

    document.getElementById('counter').textContent = `${found.size} / ${reasons.length}`;
});
