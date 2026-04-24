/**
 * Generic Authentication & Character-Shift Decryption
 */
async function _hash(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function unlock() {
    const inputField = document.getElementById('pw');
    const msg = document.getElementById('msg');
    const val = inputField.value.toLowerCase().trim();
    const config = window.PARTY_CONFIG || {};

    if (!val || !config.HASH) return;

    try {
        const hashed = await _hash(val);
        if (hashed === config.HASH || btoa(val) === config.FALLBACK) {
            showContent();
        } else {
            msg.innerText = "Access Denied.";
            inputField.value = "";
        }
    } catch (e) {
        if (val === atob(config.FALLBACK)) {
            showContent();
        } else {
            msg.innerText = "Incorrect Password.";
            inputField.value = "";
        }
    }
}

function showContent() {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    document.body.style.overflow = 'auto';
    sessionStorage.setItem('shotime_auth', 'true');

    const target = document.getElementById('geo-intel');
    const cfg = window.PARTY_CONFIG;

    if (target && cfg._e && cfg._k) {
        let decoded = "";
        for (let i = 0; i < cfg._e.length; i++) {
            // Reconstruct characters by shifting the codes back
            decoded += String.fromCharCode(cfg._e.charCodeAt(i) - cfg._k);
        }
        target.innerText = decoded;
    }
}

window.onload = () => {
    const btn = document.getElementById('submit-btn');
    const input = document.getElementById('pw');
    if (btn) btn.onclick = unlock;
    if (input) {
        input.onkeypress = (e) => { if (e.key === 'Enter') unlock(); };
    }
    if (sessionStorage.getItem('shotime_auth') === 'true') {
        showContent();
    }
};