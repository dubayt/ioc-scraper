const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
let extractedIOCs = {};

document.getElementById('extract').addEventListener('click', () => {
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.id);
                              
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        browserAPI.tabs.sendMessage(tabs[0].id, { action: 'extract', types: selectedTypes }, (response) => {
            extractedIOCs = response || {};
            displayIOCs(extractedIOCs);
        });
    });
});

// Export handlers
document.getElementById('exportCSV').addEventListener('click', () => {
    if (Object.keys(extractedIOCs).length === 0) {
        alert('No IOCs to export.');
        return;
    }
    downloadFile(convertToCSV(extractedIOCs), 'iocs.csv', 'text/csv');
});

document.getElementById('exportJSON').addEventListener('click', () => {
    if (Object.keys(extractedIOCs).length === 0) {
        alert('No IOCs to export.');
        return;
    }
    downloadFile(JSON.stringify(extractedIOCs, null, 2), 'iocs.json', 'application/json');
});

// Display functions
function displayIOCs(iocs) {
    const textarea = document.getElementById('iocDisplay');
    if (!iocs || Object.keys(iocs).length === 0) {
        textarea.value = 'No IOCs found on this page.';
        return;
    }
    
    textarea.value = Object.entries(iocs).map(([type, values]) => 
        `${type.toUpperCase()}:\n${values.map(v => `- ${v}`).join('\n')}`
    ).join('\n\n');
}

// CSV conversion
function convertToCSV(iocs) {
    return ['Type,Value', ...Object.entries(iocs).flatMap(([type, values]) =>
        values.map(v => `${type},${refang(v)}`)
    )].join('\n');
}

// File download
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Refang helper (same as content.js)
function refang(ioc) {
    return ioc.replace(/\[\.\]/g, '.');
}
