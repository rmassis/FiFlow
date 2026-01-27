const fetchCheck = async (url) => {
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.status}`);
        console.log(`Body: |${text}|`);
        try {
            JSON.parse(text);
            console.log('JSON Check: OK');
        } catch (e) {
            console.log(`JSON Check: FAILED - ${e.message}`);
        }
    } catch (e) {
        console.log(`Fetch error for ${url}: ${e.message}`);
    }
    console.log('---');
};

const run = async () => {
    console.log('Starting API diagnostics...');
    await fetchCheck('http://localhost:5173/api/categories');
    await fetchCheck('http://localhost:5173/api/transactions');
};

run();
