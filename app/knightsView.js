import * as K from './knightsConstants.js';
import { createDiv } from './learnhypertext.mjs';

class KnightsView {
    static makeDebugView(bDebug = false) {
        const oDebugView = createDiv('debug');
        if (bDebug) oDebugView.classList.add('visible');
    }

    static renderDebugMessage(sMessage) {
        const oDebugView = document.getElementById('debug');
        oDebugView.innerHTML += ' ; ' + sMessage;
    }

    static clearDebugMessage() {
        const oDebugView = document.getElementById('debug');
        oDebugView.innerHTML = '';
    }

    static isTallScreen = function () {
        const nViewportWidth = document.documentElement.clientWidth;
        const nViewportHeight = document.documentElement.clientHeight;
        return (nViewportWidth <= nViewportHeight);
    }

    static getMaximumBoardDisplaySize = function () {
        const nViewportWidth = document.documentElement.clientWidth;
        const nViewportHeight = document.documentElement.clientHeight;
        const nMaximumSize = KnightsView.isTallScreen() ? nViewportWidth : nViewportHeight;
        return nMaximumSize - K.GAMEBOARD_PIXEL_PADDING;
    }

    static getWidthOfDiscardArea = function (nMaximumBoardWidth) {
        return 4 * nMaximumBoardWidth / K.NUM_FILES;
    }

    static isSquareColorHighOrLow = function (nRankIndex, nFileIndex) {
        return (nRankIndex + nFileIndex) % 2 == 0 ? false : true;
    }

    static makeChessboard = function (oGameboardDiv, sId, nGameboardRenderType, oHandlers = {}) {
        let nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.mini) {
            nMaximumBoardWidth = K.GAMEBOARD_MINI_WIDTH;
        }
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        let oChessboardDiv = document.createElement('div');
        oChessboardDiv.id = sId ? `${K.CHESSBOARD_ID_PREFIX}-${sId}` : K.CHESSBOARD_ID_PREFIX;
        oChessboardDiv.classList.add(K.CSS_CLASS_CHESSBOARD);
        oGameboardDiv.appendChild(oChessboardDiv);
        oChessboardDiv.style.width = nMaximumBoardWidth + K.STYLE_PX;
        oChessboardDiv.style.height = nMaximumBoardWidth + K.STYLE_PX;
        let bHigh = true;
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let oSquareView = document.createElement('div');
                let sFile = K.aFiles[nFileIndex];
                oSquareView.classList.add('square');
                oSquareView.id = `${sFile}${nRank}-${sId}`;
                oSquareView.dataset.modelId = `${sFile}${nRank}`;
                oSquareView.style.width = nSquareSize + K.STYLE_PX;
                oSquareView.style.height = nSquareSize + K.STYLE_PX;
                bHigh = KnightsView.isSquareColorHighOrLow(nRankIndex, nFileIndex);
                oSquareView.classList.add(bHigh ? 'high' : 'low');
                if (oHandlers.onDragoverPreventDefault) {
                    oSquareView.addEventListener('dragover', oHandlers.onDragoverPreventDefault);
                }
                if (oHandlers.onSquareDrop) {
                    oSquareView.addEventListener('drop', oHandlers.onSquareDrop);
                }
                oChessboardDiv.appendChild(oSquareView);
            };
        }
    }

    static makeDiscard = function (oGameboardDiv, sId, oHandlers = {}) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        let oDiscardDiv = document.createElement('div');
        oDiscardDiv.id = sId ? `${K.DISCARD_ID_PREFIX}-${sId}` : K.DISCARD_ID_PREFIX;
        oDiscardDiv.classList.add('discard');
        let oDiscardBlackDiv = document.createElement('div');
        let oDiscardWhiteDiv = document.createElement('div');
        oDiscardBlackDiv.id = `${K.DISCARD_BLACK_ID}-${sId}`;
        oDiscardWhiteDiv.id = `${K.DISCARD_WHITE_ID}-${sId}`;
        oDiscardBlackDiv.dataset.modelId = K.DISCARD_BLACK_ID;
        oDiscardWhiteDiv.dataset.modelId = K.DISCARD_WHITE_ID;
        oDiscardBlackDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, K.NUM_FILES) + K.STYLE_PX;
        oDiscardBlackDiv.style.height = nSquareSize + K.STYLE_PX;
        oDiscardWhiteDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, K.NUM_FILES) + K.STYLE_PX;
        oDiscardWhiteDiv.style.height = nSquareSize + K.STYLE_PX;
        if (oHandlers.onDragoverPreventDefault) {
            oDiscardBlackDiv.addEventListener('dragover', oHandlers.onDragoverPreventDefault);
        }
        if (oHandlers.onDragoverPreventDefault) {
            oDiscardWhiteDiv.addEventListener('dragover', oHandlers.onDragoverPreventDefault);
        }
        oDiscardDiv.appendChild(oDiscardBlackDiv);
        oDiscardDiv.appendChild(oDiscardWhiteDiv);
        oGameboardDiv.appendChild(oDiscardDiv);
    }

    static makeMainGameboard = function (oGameboardDiv, sId = null, oHandlers = {}) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        KnightsView.makeChessboard(oGameboardDiv, sId, K.GAMEBOARD_RENDER_TYPES.main, oHandlers);
        if (KnightsView.isTallScreen()) {
            oGameboardDiv.style.width = nMaximumBoardWidth + K.STYLE_PX;
            oGameboardDiv.style.flexDirection = 'column';
        } else {
            oGameboardDiv.style.width = (nMaximumBoardWidth + KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, K.NUM_FILES)) + K.STYLE_PX;
        }
        if (oHandlers.onTouchMovePreventDefault) {
            oGameboardDiv.addEventListener('touchmove', oHandlers.onTouchMovePreventDefault);
        }
        document.body.appendChild(oGameboardDiv);
    }

    static makeMiniGameboard = function (oGameboardDiv, sId = null) {
        KnightsView.makeChessboard(oGameboardDiv, sId, K.GAMEBOARD_RENDER_TYPES.mini);
        oGameboardDiv.classList.add(K.CSS_CLASS_MINI);
        oGameboardDiv.style.width = K.GAMEBOARD_MINI_WIDTH + K.STYLE_PX;
        oGameboardDiv.style.flexDirection = 'column';
        document.body.appendChild(oGameboardDiv);
    }

    static makeGameboard = function (sGameboardId = null, nGameboardRenderType, oHandlers = {}) {
        let oGameboardDiv = document.createElement('div');
        oGameboardDiv.id = sGameboardId ? `${K.GAMEBOARD_ID_PREFIX}-${sGameboardId}` : K.GAMEBOARD_ID_PREFIX;
        oGameboardDiv.classList.add(K.CSS_CLASS_GAMEBOARD);
        if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.main) {
            KnightsView.makeMainGameboard(oGameboardDiv, sGameboardId, oHandlers);
        } else if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.mini) {
            KnightsView.makeMiniGameboard(oGameboardDiv, sGameboardId);
        }
        KnightsView.makeDiscard(oGameboardDiv, sGameboardId, oHandlers);
    }

    static makePiece(sPieceId, sGameboardId = null, oHandlers) {
        if (sPieceId.length > 0) {
            let sPieceClass = sPieceId.substring(0, 2);
            let oPieceView = document.createElement('div');
            oPieceView.id = `${sPieceId}-${sGameboardId}`;
            oPieceView.dataset.modelId = sPieceId;
            oPieceView.classList.add('piece');
            oPieceView.classList.add(sPieceClass);
            oPieceView.draggable = true;
            oPieceView.addEventListener('dragstart', oHandlers.onPieceDragStart);
            oPieceView.addEventListener('touchstart', oHandlers.onTouchStart);
            oPieceView.addEventListener('touchend', oHandlers.onTouchEnd);
            document.body.appendChild(oPieceView);
        }
    }

    static renderPieceInDiscard(sPieceId, sDiscardId, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
        let oPieceView = document.getElementById(sPieceIdOnGameboard);
        const sDiscardAreaOnGameboard = `${sDiscardId}-${sGameboardId}`;
        const oDiscardViewForPiece = document.getElementById(sDiscardAreaOnGameboard);
        oDiscardViewForPiece.appendChild(oPieceView);
    }

    static rerenderPieceOnChessboardMove(sOriginOfMoveId, sPieceId, sTargetOfMoveId, sGameboardId) {
        const sOriginOfMoveIdOnGameboard = `${sOriginOfMoveId}-${sGameboardId}`;
        const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
        const sTargetOfMoveIdOnGameboard = `${sTargetOfMoveId}-${sGameboardId}`;
        const oMovedFromNode = document.getElementById(sOriginOfMoveIdOnGameboard);
        const oMovedPieceNode = document.getElementById(sPieceIdOnGameboard);
        const oMovedToNode = document.getElementById(sTargetOfMoveIdOnGameboard);
        if (oMovedFromNode && oMovedPieceNode && oMovedToNode) {
            oMovedFromNode.removeChild(oMovedPieceNode);
            oMovedToNode.appendChild(oMovedPieceNode);
        }
    }

    static renderPieceOnChessboard(sPieceId, nRank, sFile, sGameboardId) {
        const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
        let oPieceView = document.getElementById(sPieceIdOnGameboard);
        if (oPieceView) {
            const sSquareId = `${sFile}${nRank}`;
            const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
            let oSquareView = document.getElementById(sSquareIdOnGameboard);
            oSquareView.appendChild(oPieceView);
        }
    }

    static killPiece(sPieceId, sSquareId, sGameboardId) {
        const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
        const oSquareView = document.getElementById(sSquareIdOnGameboard);
        const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
        const oPieceView = document.getElementById(sPieceIdOnGameboard);
        if (oSquareView && oPieceView && oSquareView.hasChildNodes(oPieceView)) {
            oSquareView.removeChild(oPieceView);
            const sDiscardAreaForPieceId = sPieceIdOnGameboard.substring(0, 1);
            const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? K.DISCARD_BLACK_ID : K.DISCARD_WHITE_ID;
            const sDiscardAreaOnGameboard = `${sDiscardAreaForPiece}-${sGameboardId}`;
            const oDiscardViewForPiece = document.getElementById(sDiscardAreaOnGameboard);
            oDiscardViewForPiece.appendChild(oPieceView);
        }
    }

    static clearPieceFromDiscardView(sPieceId, sDiscardId, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        let oPieceView = document.getElementById(sPieceId);
        const sDiscardAreaOnGameboard = `${sDiscardId}-${sGameboardId}`;
        const oDiscardViewForPiece = document.getElementById(sDiscardAreaOnGameboard);
        oDiscardViewForPiece.removeChild(oPieceView);
        document.body.appendChild(oPieceView);
    }

    static clearPieceFromChessboardView(sPieceId, sSquareId, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        if (sPieceId.length > 0) {
            const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
            let oPieceView = document.getElementById(sPieceIdOnGameboard);
            if (oPieceView) {
                const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
                let oSquareView = document.getElementById(sSquareIdOnGameboard);
                if (oSquareView.hasChildNodes(oPieceView)) {
                    oSquareView.removeChild(oPieceView);
                    document.body.appendChild(oPieceView);
                }
            }
        }
    }

    static getTargetSquareViewIdFromXY(nPageX, nPageY) {
        let sTargetOfMoveId = '';
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        if (nPageX > -1 && nPageY > -1) {
            const nFileIndex = Math.floor(nPageX / nSquareSize + K.GAMEBOARD_PIXEL_PADDING) - 2;
            const sFile = K.aFiles[nFileIndex];
            const nRankIndex = K.NUM_RANKS - Math.floor(nPageY / nSquareSize);
            const sRank = nRankIndex;
            const sSquareId = `${sFile}${sRank}`;
            const sSquareIdOnMainGameboard = `${sSquareId}-${K.GAMEBOARD_MAIN_ID}`;
            let oSquareView = document.getElementById(sSquareIdOnMainGameboard);
            if (oSquareView && oSquareView.classList.contains('square')) {
                sTargetOfMoveId = oSquareView ? oSquareView.dataset.modelId : 'none';
            }
        }
        return sTargetOfMoveId;
    }
}

export { KnightsView };