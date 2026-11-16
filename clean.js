import * as oFs from 'fs/promises';
import * as oReadline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const sApplicationDistributionPath = './app';

const oInterface = oReadline.createInterface({
    input: stdin,
    output: stdout
});

const sPathToDelete = `${sApplicationDistributionPath}`;
const sQuestion = `Delete all files in ${sPathToDelete}? [y/n]\n`;

let sUserConfirmation = '';
sUserConfirmation = await oInterface.question(sQuestion);

console.log(`\nYou answered: "${sUserConfirmation}"\n`);

oInterface.close();

const aFilesToDelete = [
    'app/index.html',
    'app/app.js',
    'app/404.html',
    'app/knightsConstants.html',
    'app/knightsModel.html',
    'app/knightsView.html',
    'app/knightsViewController.html',
    'app/screen.css',
    'app/icon.png',
    'app/logo.png',
    'app/piece-bishop.b.forhtml.png',
    'app/piece-bishop.w.forhtml.png',
    'app/piece-king.b.forhtml.png',
    'app/piece-king.w.forhtml.png',
    'app/piece-knight.b.forhtml.png',
    'app/piece-knight.w.forhtml.png',
    'app/piece-pawn.b.forhtml.png',
    'app/piece-pawn.w.forhtml.png',
    'app/piece-queen.b.forhtml.png',
    'app/piece-queen.w.forhtml.png',
    'app/piece-rook.b.forhtml.png',
    'app/piece-rook.w.forhtml.png'
]

const oStatFileOptions = {
    throwIfNoEntry: false
};

const deleteFile = async function (sFilename) {
    oFs.stat(sFilename, oStatFileOptions).then((oStat) => {
        console.log(`[success] deleted file named ${sFilename}`);
        oFs.rm(sFilename);
    }).catch((oError) => {
        console.log(`  [error] no file named ${sFilename}`);
    });
}

const deleteFiles = (aFilesToDelete) => Promise.all(aFilesToDelete.map(deleteFile));
if (sUserConfirmation === 'y') {
    await deleteFiles(aFilesToDelete);
}
