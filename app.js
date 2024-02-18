let oChessboard = {};
const NUM_RANKS = 8;
const NUM_FILES = 8;
const aFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const aImages = {
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king',
    'p': 'pawn'
}

CHESSBOARD_START = {
    'a1': 'wr',
    'b1': 'wn',
    'c1': 'wb',
    'd1': 'wq',
    'e1': 'wk',
    'f1': 'wb',
    'g1': 'wk',
    'h1': 'wr',
    'a2': 'wp',
    'b2': 'wp',
    'c2': 'wp',
    'd2': 'wp',
    'e2': 'wp',
    'f2': 'wp',
    'g2': 'wp',
    'h2': 'wp',
    'a8': 'br',
    'b8': 'bn',
    'c8': 'bb',
    'd8': 'bq',
    'e8': 'bk',
    'f8': 'bb',
    'g8': 'bk',
    'h8': 'br',
    'a7': 'bp',
    'b7': 'bp',
    'c7': 'bp',
    'd7': 'bp',
    'e7': 'bp',
    'f7': 'bp',
    'g7': 'bp',
    'h7': 'bp'
}

const clearChessboard = function () {
    let sSquareKey = '';
    for (nRankIndex = 0; nRankIndex < NUM_RANKS; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let sFile = aFiles[nFileIndex];
            sSquareKey = `${sFile}${nRank}`;
            oChessboard[sSquareKey] = '';
        }
    }
}

const setupChessboard = function (oSavedChessboard) {
    clearChessboard();
    Object.keys(oSavedChessboard).forEach(sSquareKey => {
        oChessboard[sSquareKey] = oSavedChessboard[sSquareKey];
    })
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

const drawChessboard = function (oChessboard) {
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
            let sPiece = oChessboard[`${sFile}${nRank}`];
            if (sPiece.length > 0) {
                oDiv.classList.add(sPiece);
            }
        };
    }
}

setupChessboard(CHESSBOARD_START);
drawChessboard(oChessboard);