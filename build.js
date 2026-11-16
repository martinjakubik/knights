import * as oFs from 'fs/promises';
import { promisify as oPromisify } from 'node:util';
import oChildProcess from 'node:child_process';

const sApplicationSourcePath = './src';
const sApplicationResourceSourcePath = './resources';
const sApplicationDistributionPath = './app';
const sLibraryRootPath = './node_modules'
const sAppId = 'knights';

const oMkDirOptions = {
    recursive: true,
};

const aFilesToExcludeFromApp = [
    '.DS_Store',
];

const aLibraryFilesToCopy = [{
    currentFilename: 'learnhypertext/js/index.mjs',
    newFilename: 'learnhypertext.mjs'
}, {
    currentFilename: 'client-application-settings/SettingsController.js',
    newFilename: 'SettingsController.mjs'
}, {
    currentFilename: 'client-application-settings/SettingsView.js',
    newFilename: 'SettingsView.mjs'
}];

const aResourceFilesToRename = [{
        filename: `${sAppId}-icon.png`,
    }, {
        filename: `${sAppId}-logo.png`,
    }];

const aResourceFilesToCopy = [{
        filename: 'icon.png'
    }, {
        filename: 'logo.png'
}];

// filters the content to copy from the source file directory
const filterFiles = function (sSrcPath) {
    const sFileToCheck = sSrcPath.substring(sSrcPath.indexOf('src/') + 4);
    if (aFilesToExcludeFromApp.includes(sFileToCheck)) {
        console.log(`   [info] ✗ not copying \"${sFileToCheck}\"`);
        return false;
    }
    console.log(`[success] ✔︎     copying \"${sFileToCheck}\"`);
    return true;
};

const oSrcToDistCopyOptions = {
    recursive: true,
    filter: filterFiles,
};

async function ensureDistributionDirectoryExists() {
    await oFs.mkdir(sApplicationDistributionPath, oMkDirOptions);
}

async function copySourceFiles() {
    await oFs.cp(
        sApplicationSourcePath,
        sApplicationDistributionPath,
        oSrcToDistCopyOptions,
    )
    console.log(`[success] ✔︎     copied files from \"${sApplicationSourcePath}\" to \"${sApplicationDistributionPath}\"`);
}

async function renameFile(oFileToRename) {
    let sCurrentFilename, sNewFilename;
    if (oFileToRename.filename) {
        sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToRename.filename}`;
        sNewFilename = `${sApplicationResourceSourcePath}/${oFileToRename.filename.replace(`${sAppId}-`, '')}`;
    } else if (oFileToRename.currentFilename && oFileToRename.newFilename) {
        sCurrentFilename = `${sApplicationResourceSourcePath}/${oFileToRename.currentFilename}`;
        sNewFilename = `${sApplicationResourceSourcePath}/${oFileToRename.newFilename}`;
    } else {
        return;
    }

    const oStat = await oFs.stat(sCurrentFilename);
    if (!oStat.isFile) {
        throw new Error(`  [error] ✗     \"${sCurrentFilename}\" is not a file`);
    }
    await oFs.rename(sCurrentFilename, sNewFilename);
    console.log(`[success] ✔︎     renamed file named \"${sCurrentFilename}\" to \"${sNewFilename}\"`);
}

async function copyFile(oFileToCopy, sSourcePath) {
    let sCurrentFilename, sNewFilename;
    if (oFileToCopy.filename) {
        sCurrentFilename = oFileToCopy.filename;
        sNewFilename = oFileToCopy.filename;
    } else if (oFileToCopy.currentFilename && oFileToCopy.newFilename) {
        sCurrentFilename = oFileToCopy.currentFilename;
        sNewFilename = oFileToCopy.newFilename;
    } else {
        return;
    }
    await oFs.cp(`${sSourcePath}/${sCurrentFilename}`, `${sApplicationDistributionPath}/${sNewFilename}`);
    console.log(`[success] ✔︎     copied \"${sSourcePath}/${sCurrentFilename}\" to \"${sApplicationDistributionPath}/${sNewFilename}\"`);
}

async function copyFileFromLibraries(oFileToCopy) {
    await copyFile(oFileToCopy, sLibraryRootPath);
}

async function copyFileFromResources(oFileToCopy) {
    await copyFile(oFileToCopy, sApplicationResourceSourcePath);
}

const copyLibraryFiles = (aFilesToCopy) => Promise.all(aFilesToCopy.map(copyFileFromLibraries));
const renameImages = (aFilesToRename) => Promise.all(aFilesToRename.map(renameFile));
const copyImages = (aFilesToCopy) => Promise.all(aFilesToCopy.map(copyFileFromResources));

const executeScript = oPromisify(oChildProcess.execFile);
try {
    await ensureDistributionDirectoryExists();
    await copySourceFiles();
    await copyLibraryFiles(aLibraryFilesToCopy);

    const oExportPieceResult = await executeScript('scripts/export-pieces.sh');
    console.log(`[success] ✔︎     export pieces finished with result ${oExportPieceResult.stdout}`);

    const oBuildImageResult = await executeScript('scripts/build-images.sh');
    console.log(`[success] ✔︎     build images finished with result ${oBuildImageResult.stdout}`);

    await renameImages(aResourceFilesToRename);

    await copyImages(aResourceFilesToCopy);
} catch (oError) {
    console.log(`  [error] ✗     error while building: \"${oError}\"`);
    process.exitCode = 1;
}
