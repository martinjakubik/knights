import * as KnightsConstants from './knightsConstants.js';
class KnightsModel {

    gameboard = {
        version: 1,
        chessboard: {}
    };

    constructor() {
        this.gameboard[KnightsConstants.DISCARD_WHITE_ID] = [];
        this.gameboard[KnightsConstants.DISCARD_BLACK_ID] = [];
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

    putPieceOnSquare(sPieceId, sSquareId) {
        this.getChessboard()[sSquareId] = sPieceId;
    }

    removePieceFromSquare(sSquareId) {
        this.getChessboard()[sSquareId] = '';
    }

    isPieceOnSquare(sSquareId) {
        return (this.getChessboard()[sSquareId].length > 0);
    }

    addPieceToDiscard(sPieceId, sDiscardAreaForPiece) {
        this.gameboard[sDiscardAreaForPiece].push(sPieceId);
    }

    removePieceFromDiscard(oOriginOfMove) {
        const nIndexOfPieceInDiscard = this.getGameboard()[oOriginOfMove.originId].indexOf(oOriginOfMove.pieceId);
        if (nIndexOfPieceInDiscard > -1) {
            this.getGameboard()[oOriginOfMove.originId].splice(nIndexOfPieceInDiscard, 1);
        }
    }

    killPiece(sSquareId) {
        const sPieceId = this.getPieceFromSquare(sSquareId);
        const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
        const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? KnightsConstants.DISCARD_BLACK_ID : KnightsConstants.DISCARD_WHITE_ID;
        this.removePieceFromSquare(sSquareId);
        this.addPieceToDiscard(sPieceId, sDiscardAreaForPiece);
    }
}

export { KnightsModel };