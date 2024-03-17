//import * as learnhypertext from "lib/learnhypertext.mjs";
import { KnightsView } from "./knightsView";

const STYLE_PX = 'PX';

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
const WHITE_DISCARD = 'whiteDiscard';
const BLACK_DISCARD = 'blackDiscard';

let oGameboard = {
    chessboard: {}
};
oGameboard[WHITE_DISCARD] = [];
oGameboard[BLACK_DISCARD] = [];

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

let oOriginOfMove = {};
let oTargetOfMove = {};

const clearPiecesFromChessboardModel = function () {
    let sSquareKey = '';
    for (let nRankIndex = 0; nRankIndex < NUM_RANKS; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let sFile = aFiles[nFileIndex];
            sSquareKey = `${sFile}${nRank}`;
            oGameboard.chessboard[sSquareKey] = '';
        }
    }
}

const setupChessboard = function (oSavedChessboard) {
    clearPiecesFromChessboardModel();
    Object.keys(oSavedChessboard).forEach(sSquareKey => {
        oGameboard.chessboard[sSquareKey] = oSavedChessboard[sSquareKey];
    })
}

const getMaximumBoardDisplaySize = function () {
    const nViewportWidth = document.documentElement.clientWidth;
    const nViewportHeight = document.documentElement.clientHeight;
    const nMaximumSize = KnightsView.isTallScreen() ? nViewportWidth : nViewportHeight;
    return nMaximumSize - 2;
}

const isSquareColorHighOrLow = function (nRankIndex, nFileIndex) {
    return (nRankIndex + nFileIndex) % 2 == 0 ? false : true;
}

const getMoveOriginFromPieceView = function (oPieceView) {
    let oOriginOfMove = {
        pieceId: oPieceView.id
    };
    const oParentNode = oPieceView ? oPieceView.parentNode : null;
    oOriginOfMove.originId = oPieceView ? oPieceView.parentNode.id : null;
    oOriginOfMove.originType = oParentNode ? (oParentNode.classList.contains('square') ? 0 : 1) : null;
    return oOriginOfMove;
}

const onPieceDragStart = function (oEvent) {
    const oTarget = oEvent.target;
    oOriginOfMove = getMoveOriginFromPieceView(oTarget);
    console.log(`moving piece '${oOriginOfMove.pieceId}' from ${oOriginOfMove.originId}`);
}

const onDragoverPreventDefault = function (oEvent) {
    oEvent.preventDefault();
}

const onSquareDrop = function (oEvent) {
    const oTarget = oEvent.target;
    let oSquareView = oTarget;
    if (oTarget && oTarget.classList.contains('piece')) {
        oSquareView = oTarget.parentNode;
    }
    if (oSquareView && oSquareView.classList.contains('square')) {
        oTargetOfMove.targetId = oSquareView ? oSquareView.id : 'none';
        console.log(`moved piece '${oOriginOfMove.pieceId}' from ${oOriginOfMove.originId} to ${oTargetOfMove.targetId}`);
        updateChessboardMove();
        clearMovingPieces();
    }
}

const clearMovingPieces = function () {
    oOriginOfMove = {};
    oTargetOfMove = {};
}

const killPiece = function (sSquareId) {
    const oSquareView = document.getElementById(sSquareId);
    const sPieceId = oGameboard.chessboard[sSquareId];
    const oPieceView = document.getElementById(sPieceId);
    if (oSquareView && oPieceView) {
        oSquareView.removeChild(oPieceView);
    }
    if (sPieceId) {
        const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
        const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? BLACK_DISCARD : WHITE_DISCARD;
        const oDiscardViewForPiece = document.getElementById(sDiscardAreaForPiece);
        oDiscardViewForPiece.appendChild(oPieceView);
        oGameboard[sDiscardAreaForPiece].push(sPieceId);
    }
}

const updateMoveFromSquareToSquare = function () {
    oGameboard.chessboard[oOriginOfMove.originId] = '';
    if (oGameboard.chessboard[oTargetOfMove.targetId].length > 0) {
        killPiece(oTargetOfMove.targetId);
    }
    oGameboard.chessboard[oTargetOfMove.targetId] = oOriginOfMove.pieceId;
    rerenderPiecesOnChessboardMove();
}

const updateMoveFromDiscardToSquare = function () {
    if (oGameboard.chessboard[oTargetOfMove.targetId].length == 0) {
        const nIndexOfPieceInDiscard = oGameboard[oOriginOfMove.originId].indexOf(oOriginOfMove.pieceId);
        oGameboard[oOriginOfMove.originId].splice(nIndexOfPieceInDiscard, 1);
        rerenderPiecesOnChessboardMove();
    }
}

const updateChessboardMove = function () {
    if (oOriginOfMove.originType == 0) {
        updateMoveFromSquareToSquare();
    } else {
        updateMoveFromDiscardToSquare();
    }
}

const rerenderPiecesOnChessboardMove = function () {
    const oMovedFromNode = document.getElementById(oOriginOfMove.originId);
    const oMovedPieceNode = document.getElementById(oOriginOfMove.pieceId);
    const oMovedToNode = document.getElementById(oTargetOfMove.targetId);
    if (oMovedFromNode && oMovedPieceNode && oMovedToNode) {
        oMovedFromNode.removeChild(oMovedPieceNode);
        oMovedToNode.appendChild(oMovedPieceNode);
    }
}

const transformGameboardToKnightbaseGame = function (oGameboard) {
    const oKnightbaseGame = JSON.stringify(oGameboard);
    return oKnightbaseGame;
}

const transformKnightbaseGameToGameboard = function (oKnightbaseGame) {
    clearPiecesFromChessboardView(oGameboard.chessboard);
    clearPiecesFromDiscardViewAndModel(oGameboard[WHITE_DISCARD], oGameboard[BLACK_DISCARD]);
    oGameboard = JSON.parse(oKnightbaseGame);
    renderPiecesOnChessboard(oGameboard.chessboard);
    renderPiecesInDiscard(oGameboard[WHITE_DISCARD], oGameboard[BLACK_DISCARD]);
}

const saveGame = async function () {
    const nGame = 0;
    const sUrl = `${sKnightbaseUrl}/${nGame}/save`;
    const oFormBody = new URLSearchParams();
    const oKnightbaseGame = transformGameboardToKnightbaseGame(oGameboard);
    oFormBody.set('game', oKnightbaseGame);

    const oPostOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: oFormBody
    };
    const oResponse = await fetch(sUrl, oPostOptions);
}

const loadGame = async function () {
    const nGame = 0;
    const sUrl = `${sKnightbaseUrl}/${nGame}/load`;

    const oGetOptions = {
        method: 'GET',
    };
    const oResponse = await fetch(sUrl, oGetOptions);
    if (oResponse.ok) {
        const sKnightbaseResponse = await oResponse.json();
        transformKnightbaseGameToGameboard(sKnightbaseResponse);
    }
}

const getWidthOfDiscardArea = function (nMaximumBoardWidth, NUM_FILES) {
    return 4 * nMaximumBoardWidth / NUM_FILES;
}

const makeChessboard = function (oGameboardDiv) {
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / NUM_RANKS;
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    oGameboardDiv.appendChild(oChessboardDiv);
    oChessboardDiv.style.width = nMaximumBoardWidth + STYLE_PX;
    oChessboardDiv.style.height = nMaximumBoardWidth + STYLE_PX;
    let bHigh = true;
    for (let nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let oSquareView = document.createElement('div');
            let sFile = aFiles[nFileIndex];
            oSquareView.classList.add('square');
            oSquareView.id = `${sFile}${nRank}`;
            oSquareView.style.width = nSquareSize + STYLE_PX;
            oSquareView.style.height = nSquareSize + STYLE_PX;
            bHigh = isSquareColorHighOrLow(nRankIndex, nFileIndex);
            oSquareView.classList.add(bHigh ? 'high' : 'low');
            oSquareView.addEventListener('dragover', onDragoverPreventDefault);
            oSquareView.addEventListener('drop', onSquareDrop);
            oChessboardDiv.appendChild(oSquareView);
        };
    }
}

const makeDiscard = function (oGameboardDiv) {
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    let oDiscardDiv = document.createElement('div');
    oDiscardDiv.id = 'discard';
    let oDiscardBlackDiv = document.createElement('div');
    let oDiscardWhiteDiv = document.createElement('div');
    oDiscardBlackDiv.id = BLACK_DISCARD;
    oDiscardWhiteDiv.id = WHITE_DISCARD;
    oDiscardBlackDiv.style.width = getWidthOfDiscardArea(nMaximumBoardWidth, NUM_FILES) + STYLE_PX;
    oDiscardWhiteDiv.style.width = getWidthOfDiscardArea(nMaximumBoardWidth, NUM_FILES) + STYLE_PX;
    oDiscardDiv.appendChild(oDiscardBlackDiv);
    oDiscardDiv.appendChild(oDiscardWhiteDiv);
    oGameboardDiv.appendChild(oDiscardDiv);
}

const clearPiecesFromDiscardViewAndModel = function (aWhiteDiscard, aBlackDiscard) {
    for (let i = aWhiteDiscard.length - 1; i >= 0; i--) {
        const sPieceId = aWhiteDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.removeEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(WHITE_DISCARD);
        oDiscardViewForPiece.removeChild(oPieceView);
        document.body.appendChild(oPieceView);
        aWhiteDiscard.splice(i, 1);
    }
    for (let i = aBlackDiscard.length - 1; i >= 0; i--) {
        const sPieceId = aBlackDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.removeEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(BLACK_DISCARD);
        oDiscardViewForPiece.removeChild(oPieceView);
        document.body.appendChild(oPieceView);
        aBlackDiscard.splice(i, 1);
    }
}

const clearPiecesFromChessboardView = function (oChessboard) {
    for (let nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let sFile = aFiles[nFileIndex];
            let sPieceId = oChessboard[`${sFile}${nRank}`];
            if (sPieceId.length > 0) {
                let oPieceView = document.getElementById(sPieceId);
                oPieceView.removeEventListener('dragstart', onPieceDragStart);
                let oSquareView = document.getElementById(`${sFile}${nRank}`);
                oSquareView.removeChild(oPieceView);
                document.body.appendChild(oPieceView);
            }
        };
    }
}

const renderPiecesInDiscard = function (aWhiteDiscard, aBlackDiscard) {
    for (let i = 0; i < aWhiteDiscard.length; i++) {
        const sPieceId = aWhiteDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.addEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(WHITE_DISCARD);
        oDiscardViewForPiece.appendChild(oPieceView);
    }
    for (let i = 0; i < aBlackDiscard.length; i++) {
        const sPieceId = aBlackDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.addEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(BLACK_DISCARD);
        oDiscardViewForPiece.appendChild(oPieceView);
    }
}

const renderPiecesOnChessboard = function (oChessboard) {
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / NUM_RANKS;
    for (let nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let sFile = aFiles[nFileIndex];
            let sPieceId = oChessboard[`${sFile}${nRank}`];
            if (sPieceId.length > 0) {
                let oPieceView = document.getElementById(sPieceId);
                oPieceView.style.width = nSquareSize + STYLE_PX;
                oPieceView.style.height = nSquareSize + STYLE_PX;
                oPieceView.draggable = true;
                oPieceView.addEventListener('dragstart', onPieceDragStart);
                let oSquareView = document.getElementById(`${sFile}${nRank}`);
                oSquareView.appendChild(oPieceView);
            }
        };
    }
}

const makePieces = function (oChessboard) {
    for (let nRankIndex = NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < NUM_FILES; nFileIndex++) {
            let sFile = aFiles[nFileIndex];
            let sPieceId = oChessboard[`${sFile}${nRank}`];
            let sPieceClass = sPieceId.substring(0, 2);
            if (sPieceId.length > 0) {
                let oPieceView = document.createElement('div');
                oPieceView.id = sPieceId;
                oPieceView.classList.add('piece');
                oPieceView.classList.add(sPieceClass);
                document.body.appendChild(oPieceView);
            }
        };
    }
}

const makeGameboard = function () {
    let oGameboardDiv = document.createElement('div');
    oGameboardDiv.id = 'gameboard';
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    makeChessboard(oGameboardDiv);
    makeDiscard(oGameboardDiv);
    if (KnightsView.isTallScreen()) {
        oGameboardDiv.style.width = nMaximumBoardWidth + STYLE_PX;
        oGameboardDiv.style.flexDirection = 'column';
    } else {
        oGameboardDiv.style.width = (nMaximumBoardWidth + getWidthOfDiscardArea(nMaximumBoardWidth, NUM_FILES)) + STYLE_PX;
    }
    document.body.appendChild(oGameboardDiv);
    const oSaveGameButton = document.createElement('button');
    const oLoadGameButton = document.createElement('button');
    oSaveGameButton.id = 'savegamebutton';
    oLoadGameButton.id = 'loadgamebutton';
    oSaveGameButton.innerText = 'Save';
    oLoadGameButton.innerText = 'Load';
    oSaveGameButton.onclick = saveGame;
    oLoadGameButton.onclick = loadGame;
    document.body.appendChild(oSaveGameButton);
    document.body.appendChild(oLoadGameButton);
}

setupChessboard(CHESSBOARD_START);
makeGameboard();
makePieces(oGameboard.chessboard);
renderPiecesOnChessboard(oGameboard.chessboard);