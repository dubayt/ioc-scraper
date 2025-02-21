function displayIOCs(iocs) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    for (const [type, values] of Object.entries(iocs)) {
        if (values.length > 0) {
            const header = document.createElement('h3');
            header.textContent = type;
            resultsDiv.appendChild(header);

            const list = document.createElement('ul');
            values.forEach(element => {
                const item = document.createElement('li');
                item.textContent = element;
                list.appendChild(item);
            });

            resultsDiv.appendChild(list);
        }
    }
}

browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {action: "extractIOCs"})
    .then(displayIOCs)
    .catch(error => console.error(`Error: ${error}`));
})
