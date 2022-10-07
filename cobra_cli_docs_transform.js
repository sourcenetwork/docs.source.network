/*
To transform the Cobra CLI docs into a format that can be used by docusaurus.

For each .md file under the given directory (given as CLI argument),
Replace the header with the correct frontmatter format.

How to use: `node cobra_cli_docs_transform.js docs/defradb-cli`
*/

const fs = require('fs');
const path = require('path');
const process = require('process');

const dir = process.argv[2];
if (!dir) {
    console.log('Please provide a directory as CLI argument');
    process.exit(1);
}

const files = fs.readdirSync(dir);

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const transformed = content.replace(/## (.*)/, '---\ntitle: "$1"\n---');
    fs.writeFileSync(filePath, transformed);
});
