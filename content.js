// Polyfill
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

const defaultPatterns = {
    ip: /\b\d{1,3}(?:\[\.\]|\.)\d{1,3}(?:\[\.\]|\.)\d{1,3}(?:\[\.\]|\.)\d{1,3}\b/g,
    domain: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b(?!\.exe)/g, // Refined domain regex to capture full domains and exclude .exe files
    hash: /\b[a-fA-F0-9]{32,64}\b/g,
    email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    registryKey: /\b(HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_USERS|HKEY_CLASSES_ROOT|HKEY_CURRENT_CONFIG)\\[a-zA-Z0-9\\._-]+\b/g,
    cve: /\bCVE-\d{4}-\d{4,7}\b/g
};

// Whitelist of non-malicious domains
const domainWhitelist = ['x.com', 'cisa.gov'];

// Load regex patterns
function loadPatterns() {
    const customPatterns = JSON.parse(localStorage.getItem('customPatterns')) || {};
    return { ...defaultPatterns, ...customPatterns };
}

// Refang helper
function refang(ioc) {
    return ioc.replace(/\[\.\]/g, '.');
}

// IOC extraction
function extractIOCs(selectedPatterns) {
    const text = document.body.innerText;
    const iocs = {};
    for (const [type, pattern] of Object.entries(selectedPatterns)) {
        const matches = text.match(pattern);
        if (matches) {
            iocs[type] = [...new Set(matches)].filter(match => {
                if (type === 'domain') {
                    // Exclude whitelisted domains and .exe files
                    return !domainWhitelist.includes(match.toLowerCase()) && !match.endsWith('.exe');
                }
                return true;
            }); // Deduplicate and filter
        }
    }
    return iocs;
}

// Safe highlighting
function highlightIOCs(iocs) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        let content = node.textContent;
        let modified = false;
        
        for (const type in iocs) {
            iocs[type].forEach(originalIoc => {
                const escaped = originalIoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'g');
                if (content.match(regex)) {
                    content = content.replace(regex, `<mark>${originalIoc}</mark>`);
                    modified = true;
                }
            });
        }
        
        if (modified) {
            const temp = document.createElement('div');
            temp.innerHTML = content;
            node.parentNode.replaceChild(temp, node);
        }
    }
}

// Message handling
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
        console.log('Extract action received:', request);
        const patterns = loadPatterns();
        const selectedPatterns = {};
        
        request.types.forEach(type => {
            if (patterns[type]) {
                selectedPatterns[type] = patterns[type];
            }
        });
        
        console.log('Selected patterns:', selectedPatterns);
        const iocs = extractIOCs(selectedPatterns);
        console.log('Extracted IOCs:', iocs);
        highlightIOCs(iocs);
        sendResponse(iocs);
        return true; // Required for async response
    }
});
