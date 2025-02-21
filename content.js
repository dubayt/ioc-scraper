function extractIOCs(){
    const text = document.body.innerText;
    const iocs = {
        ipv4: [],
        domains: [],
        hashes: []
    }

  // Regular expressions for different IOC types
  const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const domainRegex = /\b(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z]{2,}\b/gi;
  const hashRegex = /\b[a-fA-F0-9]{32,64}\b/g;

  iocs.ipv4 = text.match(ipv4Regex) || [];
  iocs.domains = text.match(domainRegex) || [];
  iocs.hases = text.match(hashRegex) || [];

  return iocs;
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractIOCs") {
        sendResponse(extractIOCs());
    }
});