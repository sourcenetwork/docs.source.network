const fs = require('fs');
const git = require('simple-git')();
const glob = require('glob').sync;
const tmp = require('tmp');
const path = require('path');

const repoUrl = 'https://github.com/sourcenetwork/defradb.git';
const commitHash = process.argv[2];
const subdirectory = 'docs/cli/';
const outputDir = 'docs/references/cli/';

if (!commitHash) {
    console.error('Error: Commit hash is required as an argument.');
    process.exit(1);
}

function removeOneHeaderLevel(content) {
    return content.replace(/^(#+)/gm, (match) => {
        return match.substring(1); // Remove the first '#' from the existing header level
    });
}

function removeDefradbFromHeaders(content, fileName) {
    let newContent = content;
    if (fileName !== 'defradb.md') {
        newContent = content.replace(/^(#+)\s+defradb\s*/gm, (match, p1) => {
            return p1 + ' '; // Remove 'defradb' from the header level
        });
    }
    return newContent;
}

function applyTransformations(content, transformationFunctions) {
    let transformedContent = content;
    transformationFunctions.forEach((transformationFunction) => {
        if (typeof transformationFunction === 'function') {
            transformedContent = transformationFunction(transformedContent);
        }
    });
    return transformedContent;
}

(async () => {
    try {
        const tempDir = tmp.dirSync({ unsafeCleanup: true });

        await git.clone(repoUrl, tempDir.name, { '--depth': 1 });
        const localRepo = git.cwd(tempDir.name);

        await localRepo.checkout(commitHash);

        const markdownFiles = glob(`${tempDir.name}/${subdirectory}/**/*.md`);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        markdownFiles.sort((a, b) => {
            return a.localeCompare(b);
        });

        markdownFiles.forEach((file) => {
            const relativePath = path.relative(`${tempDir.name}/${subdirectory}`, file);
            console.log(relativePath);

            const content = fs.readFileSync(file, 'utf8');

            const transformedContent = applyTransformations(content, [
                removeOneHeaderLevel,
                (content) => removeDefradbFromHeaders(content, path.basename(file))
            ]);

            const outputFile = path.join(outputDir, relativePath);
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, transformedContent, { flag: 'w' });
        });
        tempDir.removeCallback();
    } catch (error) {
        console.error('Error:', error);
    }
})();
