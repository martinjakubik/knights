#!/usr/bin/node
import * as oFs from 'fs';
import { getNiceTime } from './locallogging.js';

const ENCODING_UTF8 = 'utf8';

export class knightservice {
    static SQUARE_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'];
    static PIECE_IDS = ['br1', 'bn1', 'bb1', 'bk', 'bq', 'bb2', 'bn2', 'br2', 'bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6', 'bp7', 'bp8', 'wr1', 'wn1', 'wb1', 'wk', 'wq', 'wb2', 'wn2', 'wr2', 'wp1', 'wp2', 'wp3', 'wp4', 'wp5', 'wp6', 'wp7', 'wp8'];

    static validateKnightsDataAllFieldsPresentAndNoSpurious(oData, bDebug) {
        const bHasVersion = Object.hasOwn(oData, 'version');
        const bHasChessboard = Object.hasOwn(oData, 'chessboard');
        const bHasDiscardBlack = Object.hasOwn(oData, 'discardBlack');
        const bHasDiscardWhite = Object.hasOwn(oData, 'discardWhite');
        const bDataCountFieldsCorrect = Object.getOwnPropertyNames(oData).length == 4;
        return bHasVersion && bHasChessboard && bHasDiscardBlack && bHasDiscardWhite && bDataCountFieldsCorrect;
    }

    static validateKnightsDataValidVersion(oData, bDebug) {
        return oData.version >= 1 && oData.version <= 1 && Number.isInteger(oData.version);
    }

    static validateKnightsDataCountSquares(aDataKeys, bDebug) {
        return aDataKeys.length == 64;
    }

    static validateKnightsDataSpuriousSquare(aDataKeys, bDebug) {
        for (let i = 0; i < aDataKeys.length; i++) {
            const sDataKey = aDataKeys[i];
            if (knightservice.SQUARE_IDS.indexOf(sDataKey) == -1) {
                return false;
            }
        }
        return true;
    }

    static validateKnightsDataMissingSquare(aDataKeys, bDebug) {
        for (let i = 0; i < knightservice.SQUARE_IDS.length; i++) {
            const sSquareId = knightservice.SQUARE_IDS[i];
            if (aDataKeys.indexOf(sSquareId) == -1) {
                return false;
            }
        }
        return true;
    }

    static validateKnightsDataSpuriousOrDuplicatePiece(aDataValues, bDebug) {
        let aFoundPieceIds = [];
        for (let i = 0; i < aDataValues.length; i++) {
            const sPieceId = aDataValues[i];
            if (sPieceId && sPieceId.length > 0 && sPieceId.length < 4) {
                if (knightservice.PIECE_IDS.indexOf(sPieceId) == -1) {
                    return false;
                }
                if (aFoundPieceIds.indexOf(sPieceId) >= 0) {
                    return false;
                }
                aFoundPieceIds.push(sPieceId);
            }
        }
        return true;
    }

    static validateKnightsDataNoKingInDiscard(aDataKeys, bDebug) {
        return aDataKeys.indexOf('bk') == -1 && aDataKeys.indexOf('wk') == -1;
    }

    static validateKnightsDataColorInMatchingDiscard(aDataKeys, sDiscardId, bDebug) {
        let bValid = true;
        aDataKeys.forEach(sKey => {
            if (sKey.substring(0, 1) != sDiscardId) {
                bValid = false;
            }
        });
        return bValid;
    }

    static validateKnightsData(oData, bDebug) {
        if (!oData) {
            if (bDebug) console.log('invalid data: data missing');
            return false;
        };
        if (!knightservice.validateKnightsDataAllFieldsPresentAndNoSpurious(oData, bDebug)) {
            if (bDebug) console.log('invalid data: missing or spurious fields');
            return false;
        }
        if (!knightservice.validateKnightsDataValidVersion(oData, bDebug)) {
            if (bDebug) console.log('invalid data: invalid version');
            return false;
        }
        const oDataChessboard = oData.chessboard;
        const aDataKeys = Object.keys(oDataChessboard);
        const oDataDiscardBlack = oData.discardBlack;
        const oDataDiscardWhite = oData.discardWhite;
        if (!knightservice.validateKnightsDataCountSquares(aDataKeys, bDebug)) {
            if (bDebug) console.log('invalid data: invalid square count');
            return false;
        }
        if (!knightservice.validateKnightsDataSpuriousSquare(aDataKeys, bDebug)) {
            if (bDebug) console.log('invalid data: spurious square');
            return false;
        }
        if (!knightservice.validateKnightsDataMissingSquare(aDataKeys, bDebug)) {
            if (bDebug) console.log('invalid data: missing square');
            return false;
        }
        if (!knightservice.validateKnightsDataSpuriousOrDuplicatePiece(Object.values(oDataChessboard), bDebug)) {
            if (bDebug) console.log('invalid data: spurious or duplicate pieces on chessboard');
            return false;
        }
        if (!knightservice.validateKnightsDataSpuriousOrDuplicatePiece(Object.values(oDataDiscardBlack), bDebug)) {
            if (bDebug) console.log('invalid data: spurious or duplicate pieces in discard');
            return false;
        }
        if (!knightservice.validateKnightsDataSpuriousOrDuplicatePiece(Object.values(oDataDiscardWhite), bDebug)) {
            if (bDebug) console.log('invalid data: spurious or duplicate pieces in discard');
            return false;
        }
        if (!knightservice.validateKnightsDataNoKingInDiscard(Object.values(oDataDiscardBlack), bDebug)) {
            if (bDebug) console.log('invalid data: king in discard');
            return false;
        }
        if (!knightservice.validateKnightsDataNoKingInDiscard(Object.values(oDataDiscardWhite), bDebug)) {
            if (bDebug) console.log('invalid data: king in discard');
            return false;
        }
        if (!knightservice.validateKnightsDataColorInMatchingDiscard(Object.values(oDataDiscardBlack), 'b', bDebug)) {
            if (bDebug) console.log('invalid data: color in wrong discard');
            return false;
        }
        if (!knightservice.validateKnightsDataColorInMatchingDiscard(Object.values(oDataDiscardWhite), 'w', bDebug)) {
            if (bDebug) console.log('invalid data: color in wrong discard');
            return false;
        }
        return true;
    };

    static validateLoadedData(oLoadedData, bDebug) {
        return true;
    };

    static save(nGame, sGame, bDebug) {
        if (nGame >= 0 && nGame <= 9) {
            const sFilenamePatternKnightsGame = 'knightsgame-gamenum';
            const sFilenameKnightsGame = sFilenamePatternKnightsGame.replace('gamenum', nGame);
            oFs.writeFile(sFilenameKnightsGame, sGame, (oError) => {
                if (oError) {
                    throw oError;
                }
                const sNiceTime = getNiceTime();
            });
        }
    };

    static load(nGame, oResponse, bDebug) {
        const sFsConstantsWOrkaroundNode18_F_OK = 0;
        const sFsConstantsWOrkaroundNode18_R_OK = 4;
        if (nGame >= 0 && nGame <= 9) {
            const sFilenamePatternKnightsGame = 'knightsgame-gamenum';
            const sFilenameKnightsGame = sFilenamePatternKnightsGame.replace('gamenum', nGame);
            oFs.access(sFilenameKnightsGame, sFsConstantsWOrkaroundNode18_F_OK, (oError) => {
                if (oError) {
                    const sError = `${sFilenameKnightsGame} does not exist`;
                    console.error(sError);
                    oResponse.status(500);
                    oResponse.send(sError);
                } else {
                    oFs.access(sFilenameKnightsGame, sFsConstantsWOrkaroundNode18_R_OK, (oError) => {
                        if (oError) {
                            const sError = `${sFilenameKnightsGame} is not readable`;
                            console.error(sError);
                            oResponse.status(500);
                            oResponse.send(sError);
                        } else {
                            oFs.readFile(sFilenameKnightsGame, ENCODING_UTF8, (oError, oData) => {
                                if (oError) {
                                    throw oError;
                                }
                                const sNiceTime = getNiceTime();
                                if (!oResponse) {
                                    console.error(`knightservice: response object was not provided`);
                                }
                                if (knightservice.validateLoadedData(oData)) {
                                    oResponse.json(oData);
                                } else {
                                    console.error(`knightservice: loaded game was not valid`);
                                }
                            });
                        }
                    });
                }
            });
        }
    };
}