const fetchCheck = async (url) => {
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.status}`);
        console.log(`Body Length: ${text.length}`);
        console.log(`Body Start: |${text.substring(0, 100)}|`);
        console.log(`Body End: |${text.substring(text.length - 100)}|`);
        try {
            JSON.parse(text);
            console.log('JSON Check: OK');
        } catch (e) {
            console.log(`JSON Check: FAILED - ${e.message}`);
            // Check for position 4
            if (e.message.includes('position 4')) {
                console.log(`Character at position 4: '${text[4]}'`);
                console.log(`Surrounding text: '${text.substring(0, 10)}'`);
            }
        }
    } catch (e) {
        console.log(`Fetch error: ${e.message}`);
    }
};

fetchCheck('http://localhost:5173/api/categories');
