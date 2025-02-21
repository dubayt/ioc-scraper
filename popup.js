const browserAPI = typeof chrome !== 'undefined' ? chrome : browser; //polyfill

let extractIOCs = {}; //store IOCs for when exported


document.getElementById('extract').addEventListener('click', () => {
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.id);
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        extractedIOCs = response;
        console.log('extracted IOCs: ', extractedIOCs);
    })
})

browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {action: "extractIOCs"})
    .then(displayIOCs)
    .catch(error => console.error(`Error: ${error}`));
})
