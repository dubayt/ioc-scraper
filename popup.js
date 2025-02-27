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
  const activeIOCs = getActiveIOCs();
  if (Object.keys(activeIOCs).length === 0) {
    alert('No active IOCs to export.');
    return;
  }
  downloadFile(convertToCSV(activeIOCs), 'iocs.csv', 'text/csv');
});

function exportToYARA() {
    const activeIOCs = getActiveIOCs();
    if (Object.keys(activeIOCs).length === 0) {
      alert('No active IOCs to export.');
      return;
    }
  
    const yaraRule = `rule Extracted_IOCs {
      strings:
        ${Object.entries(activeIOCs).flatMap(([type, values]) => 
            values.map((v, i) => `$ioc_${type}_${i} = "${v}"`)).join('\n      ')}
      condition:
        any of them
    }`;
    downloadFile(yaraRule, 'iocs.yara', 'text/plain');
  }
  
document.getElementById('exportYARA').addEventListener('click', exportToYARA);

document.getElementById('exportJSON').addEventListener('click', () => {
  const activeIOCs = getActiveIOCs();
  if (Object.keys(activeIOCs).length === 0) {
    alert('No active IOCs to export.');
    return;
  }
  downloadFile(JSON.stringify(activeIOCs, null, 2), 'iocs.json', 'application/json');
});

document.getElementById('fang').addEventListener('click', () => {
  displayIOCs(extractedIOCs, false); // Display fanged IOCs
});
  
document.getElementById('defang').addEventListener('click', () => {
  displayIOCs(extractedIOCs, true); // Display defanged IOCs
});

// Display functions
function displayIOCs(iocs, defanged = false) {
    const container = document.getElementById('iocDisplay');
    container.innerHTML = '';
  
    if (!iocs || Object.keys(iocs).length === 0) {
      container.innerHTML = '<p>No IOCs found on this page.</p>';
      return;
    }
  
    Object.entries(iocs).forEach(([type, values]) => {
      if (values.length > 0) {
        const typeContainer = document.createElement('div');
        typeContainer.className = 'ioc-type-container';
        
        const typeHeader = document.createElement('h4');
        typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeHeader.style.color = getColorForType(type);
        typeContainer.appendChild(typeHeader);
  
        values.forEach(value => {
          const chip = document.createElement('div');
          chip.className = 'ioc-chip';
          chip.setAttribute('data-value', value);
          chip.setAttribute('data-type', type);
          
          const valueSpan = document.createElement('span');
          valueSpan.className = 'ioc-value';
          valueSpan.textContent = defanged ? defang(value) : value;
          chip.appendChild(valueSpan);
  
          const removeButton = document.createElement('span');
          removeButton.className = 'remove';
          removeButton.title = 'Remove';
          removeButton.textContent = '×';
          removeButton.onclick = (e) => {
            e.stopPropagation();
            chip.classList.toggle('removed');
          };
          chip.appendChild(removeButton);
  
          typeContainer.appendChild(chip);
        });
  
        container.appendChild(typeContainer);
      }
    });
}

function defang(ioc) {
  return ioc.replace(/\./g, '[.]');
}

function getColorForType(type) {
  const colors = {
    ip: 'var(--ioc-ip)',
    domain: 'var(--ioc-domain)',
    hash: 'var(--ioc-hash)',
    email: 'var(--ioc-email)',
    filePath: 'var(--ioc-filepath)',
    registryKey: 'var(--ioc-registrykey)',
    cve: 'var(--ioc-cve)',
    executable: 'var(--ioc-executable)'
  };
  return colors[type] || 'var(--primary-light)';
}

function convertToCSV(iocs) {
  return ['Type,Value', ...Object.entries(iocs).flatMap(([type, values]) =>
    values.map(v => `${type},${v}`)
  )].join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getActiveIOCs() {
    const activeIOCs = {};
    const chips = document.querySelectorAll('.ioc-chip:not(.removed)');
    
    chips.forEach(chip => {
      const type = chip.getAttribute('data-type');
      const value = chip.getAttribute('data-value'); // get the fanged value
      
      if (!activeIOCs[type]) {
        activeIOCs[type] = [];
      }
      activeIOCs[type].push(value);
    });
    
    return activeIOCs;
  }