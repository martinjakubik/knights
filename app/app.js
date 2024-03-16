//import * as learnhypertext from "lib/learnhypertext.mjs";
const STYLE_PX = 'PX';

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

const CHESSBOARD_START = {
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

const sKnightbaseUrl = 'https://www.supertitle.org:2721/knightbase';

let sMovingPieceId = '';
let sMovingFromSquareId = '';
let sMovingToSquareId = '';

const clearChessboard = function () {
    let sSquareKey = '';
    for (let nRankIndex = 0; nRankIndex < NUM_RANKS; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
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

const isTallScreen = function () {
    const nViewportWidth = document.documentElement.clientWidth;
    const nViewportHeight = document.documentElement.clientHeight;
    return (nViewportWidth <= nViewportHeight);
}
const getMaximumBoardDisplaySize = function () {
    const nViewportWidth = document.documentElement.clientWidth;
    const nViewportHeight = document.documentElement.clientHeight;
    const nMaximumSize = isTallScreen() ? nViewportWidth : nViewportHeight;
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
    return document.getElementById(sId);
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
    let oSquareTarget = oTarget;
    if (oTarget && oTarget.classList.contains('piece')) {
        oSquareTarget = oTarget.parentNode;
    }
    if (oSquareTarget && oSquareTarget.classList.contains('square')) {
        sMovingToSquareId = oSquareTarget ? oSquareTarget.id : 'none';
        console.log(`moved piece '${sMovingPieceId}' from ${sMovingFromSquareId} to ${sMovingToSquareId}`);
        updateChessboardMove();
        redrawChessboardMove();
        clearMovingPieces();
    }
}

const clearMovingPieces = function () {
    sMovingFromSquareId = null;
    sMovingToSquareId = null;
    sMovingPieceId = null;
}

const killPiece = function (sSquareId) {
    const oSquareNode = getNodeFromId(sSquareId);
    const sPieceId = oChessboard[sSquareId];
    const oPieceNode = getNodeFromId(sPieceId);
    if (oSquareNode && oPieceNode) {
        oSquareNode.removeChild(oPieceNode);
    }
    if (sPieceId) {
        const sDiscardForPieceId = sPieceId.substring(0, 1);
        const sDiscardForPiece = sDiscardForPieceId === 'b' ? 'blackDiscard' : 'whiteDiscard';
        const oDiscardForPiece = document.getElementById(sDiscardForPiece);
        oDiscardForPiece.appendChild(oPieceNode);
    }
}

const updateChessboardMove = function () {
    oChessboard[sMovingFromSquareId] = '';
    if (oChessboard[sMovingToSquareId].length > 0) {
        killPiece(sMovingToSquareId);
    }
    oChessboard[sMovingToSquareId] = sMovingPieceId;
}

const redrawChessboardMove = function () {
    const oMovedFromSquareNode = getNodeFromId(sMovingFromSquareId);
    const oMovedPieceNode = getNodeFromId(sMovingPieceId);
    const oMovedToSquareNode = getNodeFromId(sMovingToSquareId);
    if (oMovedFromSquareNode && oMovedPieceNode && oMovedFromSquareNode) {
        oMovedFromSquareNode.removeChild(oMovedPieceNode);
        oMovedToSquareNode.appendChild(oMovedPieceNode);
    }
}

const transformChessboardToKnightbaseGame = function () {
    const oKnightbaseGame = JSON.stringify(oChessboard);
    return oKnightbaseGame;
}

const saveGame = async function () {
    const nGame = 0;
    const sUrl = `${sKnightbaseUrl}/${nGame}/save`;
    const oFormBody = new URLSearchParams();
    const oKnightbaseGame = transformChessboardToKnightbaseGame();
    oFormBody.set('game', oKnightbaseGame);

    const oPostOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: oFormBody
    };
    const oResponse = await fetch(sUrl, oPostOptions)
}

const drawGameboard = function (oChessboard) {
    let oGameboardDiv = document.createElement('div');
    oGameboardDiv.id = 'gameboard';
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    let oDiscardDiv = document.createElement('div');
    oDiscardDiv.id = 'discard';
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / NUM_RANKS;
    let oDiscardBlackDiv = document.createElement('div');
    let oDiscardWhiteDiv = document.createElement('div');
    oDiscardBlackDiv.id = 'blackDiscard';
    oDiscardWhiteDiv.id = 'whiteDiscard';
    oGameboardDiv.appendChild(oChessboardDiv);
    oDiscardDiv.appendChild(oDiscardBlackDiv);
    oDiscardDiv.appendChild(oDiscardWhiteDiv);
    oGameboardDiv.appendChild(oDiscardDiv);
    if (isTallScreen()) {
        oGameboardDiv.style.width = nMaximumBoardWidth + STYLE_PX;
        oGameboardDiv.style.flexDirection = 'column';
    } else {
        oGameboardDiv.style.width = (nMaximumBoardWidth + 4 * nMaximumBoardWidth / NUM_FILES) + STYLE_PX;
    }
    oChessboardDiv.style.width = nMaximumBoardWidth + STYLE_PX;
    oChessboardDiv.style.height = nMaximumBoardWidth + STYLE_PX;
    oDiscardBlackDiv.style.width = (4 * nMaximumBoardWidth / NUM_FILES) + STYLE_PX;
    oDiscardWhiteDiv.style.width = (4 * nMaximumBoardWidth / NUM_FILES) + STYLE_PX;
    document.body.appendChild(oGameboardDiv);
    const oSaveGameButton = document.createElement('button');
    const oLoadGameButton = document.createElement('button');
    oSaveGameButton.id = 'savegamebutton';
    oLoadGameButton.id = 'loadgamebutton';
    oSaveGameButton.innerText = 'Save';
    oLoadGameButton.innerText = 'Load';
    oSaveGameButton.onclick = saveGame;
    document.body.appendChild(oSaveGameButton);
    let bHigh = true;
    for (let nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let oSquareDiv = document.createElement('div');
            let sFile = aFiles[nFileIndex];
            oSquareDiv.classList.add('square');
            oSquareDiv.id = `${sFile}${nRank}`;
            oSquareDiv.style.width = nSquareSize + STYLE_PX;
            oSquareDiv.style.height = nSquareSize + STYLE_PX;
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
                oPieceDiv.style.width = nSquareSize + STYLE_PX;
                oPieceDiv.style.height = nSquareSize + STYLE_PX;
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