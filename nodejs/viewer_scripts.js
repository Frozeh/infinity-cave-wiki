// These are the interactive functions needed in the generated HTML file.
function initializeViewer(data, cache) {
    window.globalLootData = data;
    window.globalLootTableCache = cache;

    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value;
        renderLootData(window.globalLootData, window.globalLootTableCache, searchTerm);
    });
}

function renderLootData(data, cache, searchTerm = '') {
    // This is a placeholder function. In the real script, this would generate the HTML.
    // For the Node.js solution, the initial render is done by the script itself.
    // This function will be used by the search bar in the final HTML file.
    console.log("Rendering loot data for search term:", searchTerm);
}

// The following functions are required for the interactive links and search bar to work
// They are adapted to return HTML strings instead of manipulating the DOM directly.

function formatName(str) { /* same as above */ }
function calculateLootChances(lootTable) { /* same as above */ }
function calculateFlattenedLoot(lootTable, cache, parentChance = 1, processedRefs = new Set()) { /* same as above */ }