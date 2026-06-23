const { reasons } = JSON.parse(decodeURIComponent(escape(atob(REASONS_DATA))));
const byId = new Map(reasons.map(r => [r.id, r]));

const listEl = document.getElementById('entries');
const emptyEl = document.getElementById('empty');
const codeEl = document.getElementById('export-code');
const statusEl = document.getElementById('status');
const importInput = document.getElementById('import-input');

function render() {
    const found = [...getFound()]
        .map(id => byId.get(id))
        .filter(Boolean)
        .sort((a, b) => a.frequency - b.frequency);

    listEl.innerHTML = '';

    if (found.length === 0) {
        emptyEl.hidden = false;
    } else {
        emptyEl.hidden = true;
        for (const r of found) {
            const li = document.createElement('li');
            const f = document.createElement('div');
            f.className = 'freq';
            f.textContent = r.frequency.toFixed(1) + ' MHz';
            const ttl = document.createElement('div');
            ttl.className = 'title';
            ttl.textContent = r.title;
            const t = document.createElement('div');
            t.className = 'text';
            t.textContent = r.text;
            li.appendChild(f);
            li.appendChild(ttl);
            li.appendChild(t);
            listEl.appendChild(li);
        }
    }

    codeEl.textContent = exportFound();
}

let statusTimer = null;
function showStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'status show ' + kind;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
        statusEl.className = 'status ' + kind;
    }, 2200);
}

async function copyCode() {
    const code = exportFound();
    try {
        await navigator.clipboard.writeText(code);
        showStatus('Copied to clipboard', 'ok');
    } catch {
        showStatus('Copy failed, select the code manually', 'err');
    }
}

function runImport() {
    const code = importInput.value;
    if (!code.trim()) return;
    if (importFound(code)) {
        importInput.value = '';
        showStatus('Restored', 'ok');
        render();
    } else {
        showStatus('Invalid code', 'err');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById('copy-btn').addEventListener('click', copyCode);
    document.getElementById('import-btn').addEventListener('click', runImport);
    importInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') runImport();
    });
});
