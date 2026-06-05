const STORAGE_KEY = 'tiny-radio-found';

function getFound() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw));
    } catch {
        return new Set();
    }
}

function saveFound(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function addFound(id) {
    const set = getFound();
    if (set.has(id)) return false;
    set.add(id);
    saveFound(set);
    return true;
}

function exportFound() {
    const ids = [...getFound()].sort((a, b) => a - b);
    return btoa(JSON.stringify(ids));
}

function importFound(code) {
    try {
        const ids = JSON.parse(atob(code.trim()));
        if (!Array.isArray(ids)) return false;
        const set = getFound();
        for (const id of ids) {
            if (Number.isInteger(id)) set.add(id);
        }
        saveFound(set);
        return true;
    } catch {
        return false;
    }
}
