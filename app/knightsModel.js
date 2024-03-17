import * as KnightsConstants from './knightsConstants.js';
class KnightsModel {

    gameboard = {
        chessboard: {}
    };

    constructor() {
        this.gameboard[KnightsConstants.WHITE_DISCARD] = [];
        this.gameboard[KnightsConstants.BLACK_DISCARD] = [];
    }

    clearModel() {
        let sSquareKey = '';
        for (let nRankIndex = 0; nRankIndex < KnightsConstants.NUM_RANKS; nRankIndex++) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let sFile = KnightsConstants.aFiles[nFileIndex];
                sSquareKey = `${sFile}${nRank}`;
                this.removePieceFromSquare(sSquareKey);
            }
        }
    }

    setupChessboard(oSavedChessboard) {
        this.clearModel();
        Object.keys(oSavedChessboard).forEach(sSquareKey => {
            this.gameboard.chessboard[sSquareKey] = oSavedChessboard[sSquareKey];
        })
    }

    getGameboard() {
        return this.gameboard || {};
    }

    setGameboard(oGameboard) {
        this.gameboard = oGameboard;
    }

    getChessboard() {
        return this.getGameboard().chessboard || [];
    }

    getPieceFromSquare(sSquareId) {
        return this.getChessboard()[sSquareId];
    }

    removePieceFromSquare(sSquareId) {
        this.getChessboard()[sSquareId] = '';
    }

    isPieceOnSquare(sSquareId) {
        return (this.getChessboard()[sSquareId].length > 0);
    }

    addPieceToDiscard(sDiscardAreaForPiece, sPieceId) {
        this.gameboard[sDiscardAreaForPiece].push(sPieceId);
    }

    killPiece(sSquareId) {
        const sPieceId = this.getPieceFromSquare(sSquareId);
        const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
        const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? KnightsConstants.BLACK_DISCARD : KnightsConstants.WHITE_DISCARD;
        this.removePieceFromSquare(sSquareId);
        this.addPieceToDiscard(sDiscardAreaForPiece, sPieceId);
    }
}

export { KnightsModel };