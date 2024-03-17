import * as KnightsConstants from './knightsConstants.js';
class KnightsModel {

    gameboard = {
        chessboard: {}
    };

    constructor() {
        this.gameboard[KnightsConstants.WHITE_DISCARD] = [];
        this.gameboard[KnightsConstants.BLACK_DISCARD] = [];
    }

    clearPiece(sKey) {
        this.gameboard.chessboard[sKey] = '';
    }

    clearModel() {
        let sSquareKey = '';
        for (let nRankIndex = 0; nRankIndex < KnightsConstants.NUM_RANKS; nRankIndex++) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let sFile = KnightsConstants.aFiles[nFileIndex];
                sSquareKey = `${sFile}${nRank}`;
                this.clearPiece(sSquareKey);
            }
        }
    }

    setupChessboard(oSavedChessboard) {
        this.clearModel();
        Object.keys(oSavedChessboard).forEach(sSquareKey => {
            this.gameboard.chessboard[sSquareKey] = oSavedChessboard[sSquareKey];
        })
    }
}

export { KnightsModel };