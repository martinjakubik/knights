//import * as learnhypertext from "lib/learnhypertext.mjs";
import { KnightsView } from './knightsView.js';
import { KnightsModel } from './knightsModel.js';
import { KnightsViewController } from './knightsViewController.js';
import * as KnightsConstants from './knightsConstants.js';

const STYLE_PX = 'PX';

let oModel = new KnightsModel();

const sKnightbaseUrl = 'https://www.supertitle.org:2721/knightbase';

let oOriginOfMove = {};
let oTargetOfMove = {};

const clearPiecesFromChessboardModel = function () {
    let sSquareKey = '';
    for (let nRankIndex = 0; nRankIndex < KnightsConstants.NUM_RANKS; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let sFile = KnightsConstants.aFiles[nFileIndex];
            sSquareKey = `${sFile}${nRank}`;
            oModel.getChessboard()[sSquareKey] = '';
            oModel.clearPiece(sSquareKey);
        }
    }
}

const setupChessboard = function (oSavedChessboard) {
    clearPiecesFromChessboardModel();
    oModel.clearModel();
    Object.keys(oSavedChessboard).forEach(sSquareKey => {
        oModel.getChessboard()[sSquareKey] = oSavedChessboard[sSquareKey];
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
    const sPieceId = oModel.getChessboard()[sSquareId];
    const oPieceView = document.getElementById(sPieceId);
    if (oSquareView && oPieceView) {
        oSquareView.removeChild(oPieceView);
    }
    if (sPieceId) {
        const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
        const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? KnightsConstants.BLACK_DISCARD : KnightsConstants.WHITE_DISCARD;
        const oDiscardViewForPiece = document.getElementById(sDiscardAreaForPiece);
        oDiscardViewForPiece.appendChild(oPieceView);
        oModel.getGameboard()[sDiscardAreaForPiece].push(sPieceId);
    }
}

const updateMoveFromSquareToSquare = function () {
    oModel.getChessboard()[oOriginOfMove.originId] = '';
    if (oModel.getChessboard()[oTargetOfMove.targetId].length > 0) {
        killPiece(oTargetOfMove.targetId);
    }
    oModel.getChessboard()[oTargetOfMove.targetId] = oOriginOfMove.pieceId;
    rerenderPiecesOnChessboardMove();
}

const updateMoveFromDiscardToSquare = function () {
    if (oModel.getChessboard()[oTargetOfMove.targetId].length == 0) {
        const nIndexOfPieceInDiscard = oModel.getGameboard()[oOriginOfMove.originId].indexOf(oOriginOfMove.pieceId);
        oModel.getGameboard()[oOriginOfMove.originId].splice(nIndexOfPieceInDiscard, 1);
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
    clearPiecesFromChessboardView(oModel.getChessboard());
    clearPiecesFromDiscardViewAndModel(oModel.getGameboard()[KnightsConstants.WHITE_DISCARD], oModel.getGameboard()[KnightsConstants.BLACK_DISCARD]);
    oModel.setGameboard(JSON.parse(oKnightbaseGame));
    renderPiecesOnChessboard(oModel.getChessboard());
    renderPiecesInDiscard(oModel.getGameboard()[KnightsConstants.WHITE_DISCARD], oModel.getGameboard()[KnightsConstants.BLACK_DISCARD]);
}

const saveGame = async function () {
    const nGame = 0;
    const sUrl = `${sKnightbaseUrl}/${nGame}/save`;
    const oFormBody = new URLSearchParams();
    const oKnightbaseGame = transformGameboardToKnightbaseGame(oModel.getGameboard());
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

const getWidthOfDiscardArea = function (nMaximumBoardWidth) {
    return 4 * nMaximumBoardWidth / KnightsConstants.NUM_FILES;
}

const makeChessboard = function (oGameboardDiv) {
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / KnightsConstants.NUM_RANKS;
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    oGameboardDiv.appendChild(oChessboardDiv);
    oChessboardDiv.style.width = nMaximumBoardWidth + STYLE_PX;
    oChessboardDiv.style.height = nMaximumBoardWidth + STYLE_PX;
    let bHigh = true;
    for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let oSquareView = document.createElement('div');
            let sFile = KnightsConstants.aFiles[nFileIndex];
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
    oDiscardBlackDiv.id = KnightsConstants.BLACK_DISCARD;
    oDiscardWhiteDiv.id = KnightsConstants.WHITE_DISCARD;
    oDiscardBlackDiv.style.width = getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES) + STYLE_PX;
    oDiscardWhiteDiv.style.width = getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES) + STYLE_PX;
    oDiscardDiv.appendChild(oDiscardBlackDiv);
    oDiscardDiv.appendChild(oDiscardWhiteDiv);
    oGameboardDiv.appendChild(oDiscardDiv);
}

const clearPiecesFromDiscardViewAndModel = function (aWhiteDiscard, aBlackDiscard) {
    for (let i = aWhiteDiscard.length - 1; i >= 0; i--) {
        const sPieceId = aWhiteDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.removeEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(KnightsConstants.WHITE_DISCARD);
        oDiscardViewForPiece.removeChild(oPieceView);
        document.body.appendChild(oPieceView);
        aWhiteDiscard.splice(i, 1);
    }
    for (let i = aBlackDiscard.length - 1; i >= 0; i--) {
        const sPieceId = aBlackDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.removeEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(KnightsConstants.BLACK_DISCARD);
        oDiscardViewForPiece.removeChild(oPieceView);
        document.body.appendChild(oPieceView);
        aBlackDiscard.splice(i, 1);
    }
}

const clearPiecesFromChessboardView = function (oChessboard) {
    for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let sFile = KnightsConstants.aFiles[nFileIndex];
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
        const oDiscardViewForPiece = document.getElementById(KnightsConstants.WHITE_DISCARD);
        oDiscardViewForPiece.appendChild(oPieceView);
    }
    for (let i = 0; i < aBlackDiscard.length; i++) {
        const sPieceId = aBlackDiscard[i];
        let oPieceView = document.getElementById(sPieceId);
        oPieceView.addEventListener('dragstart', onPieceDragStart);
        const oDiscardViewForPiece = document.getElementById(KnightsConstants.BLACK_DISCARD);
        oDiscardViewForPiece.appendChild(oPieceView);
    }
}

const renderPiecesOnChessboard = function (oChessboard) {
    const nMaximumBoardWidth = getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / KnightsConstants.NUM_RANKS;
    for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let sFile = KnightsConstants.aFiles[nFileIndex];
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
    for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let sFile = KnightsConstants.aFiles[nFileIndex];
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
        oGameboardDiv.style.width = (nMaximumBoardWidth + getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES)) + STYLE_PX;
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

oModel.setupChessboard(KnightsConstants.CHESSBOARD_START);
makeGameboard();
makePieces(oModel.getChessboard());
renderPiecesOnChessboard(oModel.getChessboard());