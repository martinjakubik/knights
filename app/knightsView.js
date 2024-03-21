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

    static isSquareColorHighOrLow = function (nRankIndex, nFileIndex) {
        return (nRankIndex + nFileIndex) % 2 == 0 ? false : true;
    }
}

export { KnightsView };