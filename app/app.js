//import * as learnhypertext from "lib/learnhypertext.mjs";
import { KnightsView } from './knightsView.js';
import { KnightsModel } from './knightsModel.js';
import { KnightsViewController } from './knightsViewController.js';
import * as KnightsConstants from './knightsConstants.js';

let oModel = new KnightsModel();
let oKnightsViewController = new KnightsViewController(oModel);

const sKnightbaseUrl = 'https://www.supertitle.org:2721/knightbase';

let oOriginOfMove = {};
let oTargetOfMove = {};

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
    const sPieceId = oModel.getPieceFromSquare(sSquareId);
    const oPieceView = document.getElementById(sPieceId);
    if (oSquareView && oPieceView) {
        oSquareView.removeChild(oPieceView);
    }
    if (sPieceId) {
        const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
        const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? KnightsConstants.BLACK_DISCARD : KnightsConstants.WHITE_DISCARD;
        const oDiscardViewForPiece = document.getElementById(sDiscardAreaForPiece);
        oDiscardViewForPiece.appendChild(oPieceView);
        oModel.killPiece(sSquareId);
    }
}

const updateMoveFromSquareToSquare = function () {
    oModel.removePieceFromSquare(oOriginOfMove.originId);
    if (oModel.isPieceOnSquare(oTargetOfMove.targetId)) {
        killPiece(oTargetOfMove.targetId);
    }
    oModel.getChessboard()[oTargetOfMove.targetId] = oOriginOfMove.pieceId;
    rerenderPiecesOnChessboardMove();
}

const updateMoveFromDiscardToSquare = function () {
    if (!oModel.isPieceOnSquare(oTargetOfMove.targetId)) {
        oModel.removePieceFromDiscard(oOriginOfMove);
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
    const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
    const nSquareSize = nMaximumBoardWidth / KnightsConstants.NUM_RANKS;
    for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
        let nRank = nRankIndex + 1;
        for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
            let sFile = KnightsConstants.aFiles[nFileIndex];
            let sPieceId = oChessboard[`${sFile}${nRank}`];
            if (sPieceId.length > 0) {
                let oPieceView = document.getElementById(sPieceId);
                oPieceView.style.width = nSquareSize + KnightsConstants.STYLE_PX;
                oPieceView.style.height = nSquareSize + KnightsConstants.STYLE_PX;
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

oModel.setupChessboard(KnightsConstants.CHESSBOARD_START);
KnightsView.makeGameboard({
    saveGame: saveGame,
    loadGame: loadGame,
    onDragoverPreventDefault: onDragoverPreventDefault,
    onSquareDrop: onSquareDrop
});
makePieces(oModel.getChessboard());
renderPiecesOnChessboard(oModel.getChessboard());