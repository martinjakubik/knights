import * as KnightsConstants from './knightsConstants.js';

class KnightsView {
    static isTallScreen = function () {
        const nViewportWidth = document.documentElement.clientWidth;
        const nViewportHeight = document.documentElement.clientHeight;
        return (nViewportWidth <= nViewportHeight);
    }

    static getMaximumBoardDisplaySize = function () {
        const nViewportWidth = document.documentElement.clientWidth;
        const nViewportHeight = document.documentElement.clientHeight;
        const nMaximumSize = KnightsView.isTallScreen() ? nViewportWidth : nViewportHeight;
        return nMaximumSize - KnightsConstants.NUM_GAMEBOARD_PIXEL_PADDING;
    }

    static getWidthOfDiscardArea = function (nMaximumBoardWidth) {
        return 4 * nMaximumBoardWidth / KnightsConstants.NUM_FILES;
    }

    static isSquareColorHighOrLow = function (nRankIndex, nFileIndex) {
        return (nRankIndex + nFileIndex) % 2 == 0 ? false : true;
    }

    static makeChessboard = function (oGameboardDiv, oHandlers) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / KnightsConstants.NUM_RANKS;
        let oChessboardDiv = document.createElement('div');
        oChessboardDiv.id = 'chessboard';
        oGameboardDiv.appendChild(oChessboardDiv);
        oChessboardDiv.style.width = nMaximumBoardWidth + KnightsConstants.STYLE_PX;
        oChessboardDiv.style.height = nMaximumBoardWidth + KnightsConstants.STYLE_PX;
        let bHigh = true;
        for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let oSquareView = document.createElement('div');
                let sFile = KnightsConstants.aFiles[nFileIndex];
                oSquareView.classList.add('square');
                oSquareView.id = `${sFile}${nRank}`;
                oSquareView.style.width = nSquareSize + KnightsConstants.STYLE_PX;
                oSquareView.style.height = nSquareSize + KnightsConstants.STYLE_PX;
                bHigh = KnightsView.isSquareColorHighOrLow(nRankIndex, nFileIndex);
                oSquareView.classList.add(bHigh ? 'high' : 'low');
                oSquareView.addEventListener('dragover', oHandlers.onDragoverPreventDefault);
                oSquareView.addEventListener('drop', oHandlers.onSquareDrop);
                oChessboardDiv.appendChild(oSquareView);
            };
        }
    }

    static makeDiscard = function (oGameboardDiv) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        let oDiscardDiv = document.createElement('div');
        oDiscardDiv.id = 'discard';
        let oDiscardBlackDiv = document.createElement('div');
        let oDiscardWhiteDiv = document.createElement('div');
        oDiscardBlackDiv.id = KnightsConstants.BLACK_DISCARD;
        oDiscardWhiteDiv.id = KnightsConstants.WHITE_DISCARD;
        oDiscardBlackDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES) + KnightsConstants.STYLE_PX;
        oDiscardWhiteDiv.style.width = KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES) + KnightsConstants.STYLE_PX;
        oDiscardDiv.appendChild(oDiscardBlackDiv);
        oDiscardDiv.appendChild(oDiscardWhiteDiv);
        oGameboardDiv.appendChild(oDiscardDiv);
    }

    static makeGameboard = function (oHandlers) {
        let oGameboardDiv = document.createElement('div');
        oGameboardDiv.id = 'gameboard';
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        KnightsView.makeChessboard(oGameboardDiv, oHandlers);
        KnightsView.makeDiscard(oGameboardDiv);
        if (KnightsView.isTallScreen()) {
            oGameboardDiv.style.width = nMaximumBoardWidth + KnightsConstants.STYLE_PX;
            oGameboardDiv.style.flexDirection = 'column';
        } else {
            oGameboardDiv.style.width = (nMaximumBoardWidth + KnightsView.getWidthOfDiscardArea(nMaximumBoardWidth, KnightsConstants.NUM_FILES)) + KnightsConstants.STYLE_PX;
        }
        oGameboardDiv.addEventListener('touchmove', oHandlers.onTouchMovePreventDefault);
        document.body.appendChild(oGameboardDiv);
        const oSaveGameButton = document.createElement('button');
        const oLoadGameButton = document.createElement('button');
        oSaveGameButton.id = 'savegamebutton';
        oLoadGameButton.id = 'loadgamebutton';
        oSaveGameButton.innerText = 'Save';
        oLoadGameButton.innerText = 'Load';
        oSaveGameButton.onclick = oHandlers.saveGame;
        oLoadGameButton.onclick = oHandlers.loadGame;
        document.body.appendChild(oSaveGameButton);
        document.body.appendChild(oLoadGameButton);
    }
}

export { KnightsView };