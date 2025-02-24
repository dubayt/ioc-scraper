const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

const fileExtensions = ['exe', 'dll', 'bat', 'ps1', 'vbs', 'js', 'py', 'rb', 'sh', 'aspx'];

const defaultPatterns = {
  ip: /\b\d{1,3}(?:\[\.\]|\.)\d{1,3}(?:\[\.\]|\.)\d{1,3}(?:\[\.\]|\.)\d{1,3}\b|(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(?::[0-9a-fA-F]{1,4}){1,7}|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::)/g,  domain: /\b(?!(?:\d{1,3}\.){3}\d{1,3}\b)(?:[a-zA-Z0-9-]+(?:\[\.\]|\.))+[a-zA-Z]{2,}\b(?!\.(?:exe|dll|bat|ps1|vbs|js|py|rb|sh))\b/g,
  hash: /\b[a-fA-F0-9]{32,64}\b/g,
  email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  filePath: /\b(?:[A-Z]:\\[^\\<>:"|?*\n\r]+\\[^\\<>:"|?*\n\r]*|\/(?:etc|var|usr|bin|sbin|home|tmp|opt|root|boot|srv|dev|proc|sys|lib|lib64)(?:\/[a-zA-Z0-9._-]+)+)\b/gi,
  registryKey: /\b(HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_USERS|HKEY_CLASSES_ROOT|HKEY_CURRENT_CONFIG)\\[a-zA-Z0-9\\._-]+\b/g,
  cve: /\bCVE-\d{4}-\d{4,7}\b/g,
  executable: new RegExp(`\\b[a-zA-Z0-9-_\\.]+\\.(${fileExtensions.join('|')})\\b`, 'gi')
};

const domainWhitelist = [
  'x.com', 'linkedin.com', 'cisa.gov', 'justice.gov', 'nist.gov',
  'microsoft.com', 'google.com', 'blackberry.com', 'cert.gov.ua',
  'atera.com', 'csolve.net', 'tech-keys.com'
];

function loadPatterns() {
  const customPatterns = JSON.parse(localStorage.getItem('customPatterns')) || {};
  return { ...defaultPatterns, ...customPatterns };
}

function refang(ioc) {
  return ioc.replace(/\[\.\]/g, '.');
}

function isDomainWhitelisted(domain) {
  return domainWhitelist.some(whiteDomain => {
    return domain === whiteDomain || domain.endsWith('.' + whiteDomain);
  });
}

function extractIOCs(selectedPatterns) {
    const text = document.body.innerText;
    const iocs = {};
    for (const [type, pattern] of Object.entries(selectedPatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        const refangedMatches = matches.map(refang);
        const uniqueRefanged = [...new Set(refangedMatches)];
        if (type === 'domain') {
          iocs[type] = uniqueRefanged.filter(match => {
            const lowerMatch = match.toLowerCase();
            return !isDomainWhitelisted(lowerMatch) && !fileExtensions.some(ext => lowerMatch.endsWith('.' + ext));
          });
        } else {
          iocs[type] = uniqueRefanged;
        }
      }
    }
    return iocs;
  }

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    const patterns = loadPatterns();
    const selectedPatterns = {};
    
    request.types.forEach(type => {
      if (patterns[type]) {
        selectedPatterns[type] = patterns[type];
      }
    });
    
    const iocs = extractIOCs(selectedPatterns);
    sendResponse(iocs);
    return true; // Required for async response
  }
});