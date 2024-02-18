let aChessboard = [];
const NUM_RANKS = 8;
const NUM_FILES = 8;
const aFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

for (nRankIndex = 0; nRankIndex < NUM_RANKS; nRankIndex++) {
    let aRank = [];
    for (nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
        aRank.push(undefined);
    }
    aChessboard.push(aRank);
}

const getMaximumBoardDisplaySize = function () {
    const nViewportWidth = document.documentElement.clientWidth;
    const nViewportHeight = document.documentElement.clientHeight;
    const nMaximumSize = nViewportWidth <= nViewportHeight ? nViewportWidth : nViewportHeight;
    return nMaximumSize;
}

const getHighLowForSquare = function (nRankIndex, nFileIndex) {
    return (nRankIndex + nFileIndex) % 2 == 0 ? true : false;
}

const drawChessboard = function (aChessboard) {
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    oChessboardDiv.style.width = nMaximumBoardWidth;
    oChessboardDiv.style.height = nMaximumBoardWidth;
    const nSquareSize = nMaximumBoardWidth / NUM_RANKS;
    document.body.appendChild(oChessboardDiv);
    let bHigh = true;
    for (nRankIndex = 0; nRankIndex < NUM_RANKS; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let oDiv = document.createElement('div');
            let sFile = aFiles[nFileIndex];
            oDiv.classList.add('square');
            oDiv.id = `${sFile}${nRank}`;
            oDiv.style.width = nSquareSize;
            oDiv.style.height = nSquareSize;
            bHigh = getHighLowForSquare(nRankIndex, nFileIndex);
            oDiv.classList.add(bHigh ? 'high' : 'low');
            oChessboardDiv.appendChild(oDiv);
        };
    }
}

drawChessboard();