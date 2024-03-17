import * as KnightsConstants from './knightsConstants.js';
class KnightsModel {
    constructor() {
        gameboard = {
            chessboard: {}
        };
        gameboard[KnightsConstants.WHITE_DISCARD] = [];
        gameboard[KnightsConstants.BLACK_DISCARD] = [];
    }
}

export { KnightsModel };