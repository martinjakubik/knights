let oChessboard = {};
const NUM_RANKS = 8;
const NUM_FILES = 8;
// files: a, b, c, ..., h
// ranks: 1, 2, 3, ..., 8
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
    'a1': 'wr1',
    'b1': 'wn1',
    'c1': 'wb1',
    'd1': 'wq',
    'e1': 'wk',
    'f1': 'wb2',
    'g1': 'wn2',
    'h1': 'wr2',
    'a2': 'wp1',
    'b2': 'wp2',
    'c2': 'wp3',
    'd2': 'wp4',
    'e2': 'wp5',
    'f2': 'wp6',
    'g2': 'wp7',
    'h2': 'wp8',
    'a8': 'br1',
    'b8': 'bn1',
    'c8': 'bb1',
    'd8': 'bq',
    'e8': 'bk',
    'f8': 'bb2',
    'g8': 'bn2',
    'h8': 'br2',
    'a7': 'bp1',
    'b7': 'bp2',
    'c7': 'bp3',
    'd7': 'bp4',
    'e7': 'bp5',
    'f7': 'bp6',
    'g7': 'bp7',
    'h7': 'bp8'
};

let sMovingPieceId = '';
let sMovingFromSquareId = '';
let sMovingToSquareId = '';

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

const isSquareColorHighOrLow = function (nRankIndex, nFileIndex) {
    return (nRankIndex + nFileIndex) % 2 == 0 ? false : true;
}

const getSquareIdFromPieceNode = function (oPieceNode) {
    const oSquareNode = oPieceNode ? oPieceNode.parentNode : null;
    return oSquareNode ? oSquareNode.id : null;
}

const getNodeFromId = function (sId) {
    return oDiv = document.getElementById(sId);
}

const onPieceDragStart = function (oEvent) {
    const oTarget = oEvent.target;
    sMovingFromSquareId = getSquareIdFromPieceNode(oTarget);
    sMovingPieceId = oChessboard[sMovingFromSquareId];
    console.log(`moving piece '${sMovingPieceId}' from ${sMovingFromSquareId}`);
}

const onDragoverPreventDefault = function (oEvent) {
    oEvent.preventDefault();
}

const onSquareDrop = function (oEvent) {
    const oTarget = oEvent.target;
    sMovingToSquareId = oTarget ? oTarget.id : 'none';
    console.log(`moved piece '${sMovingPieceId}' from ${sMovingFromSquareId} to ${sMovingToSquareId}`);
    updateChessboard();
    redrawChessboard();
    clearMovingPieces();
}

const clearMovingPieces = function () {
    sMovingFromSquareId = null;
    sMovingToSquareId = null;
    sMovingPieceId = null;
}

const updateChessboard = function () {
    oChessboard[sMovingFromSquareId] = '';
    oChessboard[sMovingToSquareId] = sMovingPieceId;
}

const redrawChessboard = function () {
    const oMovedFromSquareNode = getNodeFromId(sMovingFromSquareId);
    const oMovedPieceNode = getNodeFromId(sMovingPieceId);
    const oMovedToSquareNode = getNodeFromId(sMovingToSquareId);
    if (oMovedFromSquareNode && oMovedPieceNode && oMovedFromSquareNode) {
        oMovedFromSquareNode.removeChild(oMovedPieceNode);
        oMovedToSquareNode.appendChild(oMovedPieceNode);
    }
}

const drawGameboard = function (oChessboard) {
    let oGameDiv = document.createElement('div');
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    oGameDiv.style.width = nMaximumBoardWidth;
    oChessboardDiv.style.width = nMaximumBoardWidth;
    oChessboardDiv.style.height = nMaximumBoardWidth;
    const nSquareSize = nMaximumBoardWidth / NUM_RANKS;
    let oDiscardBlackDiv = document.createElement('div');
    let oDiscardWhiteDiv = document.createElement('div');
    oDiscardBlackDiv.style.width = nMaximumBoardWidth;
    oDiscardBlackDiv.style.height = nSquareSize;
    oDiscardWhiteDiv.style.width = nMaximumBoardWidth;
    oDiscardWhiteDiv.style.height = nSquareSize;
    oGameDiv.appendChild(oDiscardBlackDiv);
    oGameDiv.appendChild(oChessboardDiv);
    oGameDiv.appendChild(oDiscardWhiteDiv);
    document.body.appendChild(oGameDiv);
    let bHigh = true;
    for (nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let oSquareDiv = document.createElement('div');
            let sFile = aFiles[nFileIndex];
            oSquareDiv.classList.add('square');
            oSquareDiv.id = `${sFile}${nRank}`;
            oSquareDiv.style.width = nSquareSize;
            oSquareDiv.style.height = nSquareSize;
            bHigh = isSquareColorHighOrLow(nRankIndex, nFileIndex);
            oSquareDiv.classList.add(bHigh ? 'high' : 'low');
            oSquareDiv.addEventListener('dragover', onDragoverPreventDefault);
            oSquareDiv.addEventListener('drop', onSquareDrop);
            oChessboardDiv.appendChild(oSquareDiv);
            let sPieceId = oChessboard[`${sFile}${nRank}`];
            let sPieceClass = sPieceId.substring(0, 2);
            if (sPieceId.length > 0) {
                let oPieceDiv = document.createElement('div');
                oPieceDiv.id = sPieceId;
                oPieceDiv.classList.add('piece');
                oPieceDiv.classList.add(sPieceClass);
                oPieceDiv.style.width = nSquareSize;
                oPieceDiv.style.height = nSquareSize;
                oPieceDiv.draggable = true;
                oPieceDiv.addEventListener('dragstart', onPieceDragStart);
                oSquareDiv.addEventListener('dragover', onDragoverPreventDefault);
                oSquareDiv.appendChild(oPieceDiv);
            }
        };
    }
}

setupChessboard(CHESSBOARD_START);
drawGameboard(oChessboard);