const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// --- Helper Functions for Data Processing (same as before) ---
function formatName(str) {
    if (!str) return 'Unknown';
    const cleanStr = str.replace(/^.*:(.*)$/, '$1').replace(/^[^/]*\//, '');
    return cleanStr
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// --- Main Execution Logic ---
async function main() {
    const zipPath = process.argv[2];
    if (!zipPath) {
        console.error('Error: Please provide the path to the zip file.');
        console.log('Usage: node generate_loot_table.js <path_to_your_zip_file>');
        process.exit(1);
    }

    if (!fs.existsSync(zipPath)) {
        console.error(`Error: The file '${zipPath}' was not found.`);
        process.exit(1);
    }

    try {
        console.log(`Reading and processing '${zipPath}'...`);
        const zipData = fs.readFileSync(zipPath);
        const zip = await JSZip.loadAsync(zipData);

        const globalLootData = {};
        const globalLootTableCache = {};
        const filePromises = [];

        zip.forEach((relativePath, zipEntry) => {
            if (relativePath.startsWith("data/infinity_cave/loot_table/") && relativePath.endsWith(".json")) {
                const tablePath = relativePath.replace("data/", "").replace(".json", "");
                filePromises.push(
                    zipEntry.async("string").then(content => {
                        try {
                            globalLootTableCache[tablePath] = JSON.parse(content);
                        } catch {
                            globalLootTableCache[tablePath] = null;
                        }
                    })
                );
            }
        });

        await Promise.all(filePromises);

        Object.keys(globalLootTableCache).forEach(path => {
            const mobMatch = path.match(/^infinity_cave\/loot_table\/([^/]+)\/([^/]+)\/([^/]+)$/);
            if (mobMatch) {
                const [, biome, tier, mob] = mobMatch;
                if (!globalLootData[biome]) globalLootData[biome] = {};
                if (!globalLootData[biome][tier]) globalLootData[biome][tier] = {};
                globalLootData[biome][tier][mob] = globalLootTableCache[path];
            }
        });

        console.log('Data loaded successfully. Generating HTML...');

        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loot Table Output</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>

<div class="navigation-bar">
    <a href="index.html">Home</a>
    <a href="loot_table_output.html" class="active">Loot Tables</a>
    <a href="biomes/amethyst.html">Amethyst Biome</a>
    <a href="biomes/deeprock.html">Deeprock Biome</a>
    <a href="biomes/sulfide.html">Sulfide Biome</a>
    <a href="biomes/molten.html">Molten Biome</a>
    <a href="biomes/frozen.html">Frozen Biome</a>
    <a href="biomes/mushroom.html">Mushroom Biome</a>
    <a href="biomes/limestone.html">Limestone Biome</a>
    <a href="biomes/deep_dark.html">Deep Dark Biome</a>
</div>

<div class="main-container">
    <h1>Loot Table Extractor</h1>
    <div class="search-container">
        <input type="search" id="searchInput" placeholder="Search loot tables and items...">
    </div>
    <div id="output" class="output-section"></div>
</div>

<script>
    // Define the global data variables first.
    const globalLootData = ${JSON.stringify(globalLootData)};
    const globalLootTableCache = ${JSON.stringify(globalLootTableCache)};
</script>

<script src="scripts/search.js"></script>

</body>
</html>
        `;

        fs.writeFileSync('loot_table_output.html', fullHtml, 'utf8');
        console.log('HTML file `loot_table_output.html` generated successfully!');

    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

main();