import * as K from './knightsConstants.js';

class KnightsView {
    static sGameboardIdPrefix = 'gameboard';
    static sChessboardIdPrefix = 'chessboard';

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
        oChessboardDiv.id = sId ? `${KnightsView.sChessboardIdPrefix}-${sId}` : KnightsView.sChessboardIdPrefix;
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

    static makeDiscard = function (oGameboardDiv) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        let oDiscardDiv = document.createElement('div');
        oDiscardDiv.id = 'discard';
        let oDiscardBlackDiv = document.createElement('div');
        let oDiscardWhiteDiv = document.createElement('div');
        oDiscardBlackDiv.id = K.BLACK_DISCARD_ID;
        oDiscardWhiteDiv.id = K.WHITE_DISCARD_ID;
        oDiscardBlackDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, K.NUM_FILES) + K.STYLE_PX;
        oDiscardBlackDiv.style.height = nSquareSize + K.STYLE_PX;
        oDiscardWhiteDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, K.NUM_FILES) + K.STYLE_PX;
        oDiscardWhiteDiv.style.height = nSquareSize + K.STYLE_PX;
        oDiscardDiv.appendChild(oDiscardBlackDiv);
        oDiscardDiv.appendChild(oDiscardWhiteDiv);
        oGameboardDiv.appendChild(oDiscardDiv);
    }

    static makeMainGameboard = function (oGameboardDiv, sId = null, oHandlers = {}) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        KnightsView.makeChessboard(oGameboardDiv, sId, K.GAMEBOARD_RENDER_TYPES.main, oHandlers);
        KnightsView.makeDiscard(oGameboardDiv);
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
        const oSaveGameButton = document.createElement('button');
        const oLoadGameButton = document.createElement('button');
        oSaveGameButton.id = 'savegamebutton';
        oLoadGameButton.id = 'loadgamebutton';
        oSaveGameButton.innerText = 'Save';
        oLoadGameButton.innerText = 'Load';
        if (oHandlers.saveGame) {
            oSaveGameButton.onclick = oHandlers.saveGame;
        }
        if (oHandlers.loadGame) {
            oLoadGameButton.onclick = oHandlers.loadGame;
        }
        document.body.appendChild(oSaveGameButton);
        document.body.appendChild(oLoadGameButton);
    }

    static makeMiniGameboard = function (oGameboardDiv, sId = null) {
        KnightsView.makeChessboard(oGameboardDiv, sId, K.GAMEBOARD_RENDER_TYPES.mini);
        oGameboardDiv.style.width = K.GAMEBOARD_MINI_WIDTH + K.STYLE_PX;
        oGameboardDiv.style.flexDirection = 'column';
        document.body.appendChild(oGameboardDiv);
    }

    static makeGameboard = function (sId = null, nGameboardRenderType, oHandlers = {}) {
        let oGameboardDiv = document.createElement('div');
        oGameboardDiv.id = sId ? `${KnightsView.sGameboardIdPrefix}-${sId}` : KnightsView.sGameboardIdPrefix;
        oGameboardDiv.classList.add(K.CSS_CLASS_GAMEBOARD);
        if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.main) {
            KnightsView.makeMainGameboard(oGameboardDiv, sId, oHandlers);
        } else if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.mini) {
            KnightsView.makeMiniGameboard(oGameboardDiv, sId);
        }
    }
}

export { KnightsView };