import { KnightsView } from './knightsView.js';
import { KnightsModel } from './knightsModel.js';
import * as K from './knightsConstants.js';

class KnightsViewController {
    model = {};

    constructor(oAppConfig) {
        this.model = new KnightsModel();
        this.originOfMove = {};
        this.targetOfMove = {};
        this.currentTouchPageX = -1;
        this.currentTouchPageY = -1;
        this.currentMiniGameboard = 0;
        this.knightbaseUrl = 'https://www.supertitle.org:2721/knightbase';
        if (oAppConfig && oAppConfig.protocol && oAppConfig.hostname && oAppConfig.port) {
            this.knightbaseUrl = `${oAppConfig.protocol}://${oAppConfig.hostname}:${oAppConfig.port}/${K.KNIGHTBASE_PATH}`;
        }
        this.debug = oAppConfig ? (oAppConfig.debug == true) : false;
    }

    static getMoveOriginFromPieceView(oPieceView) {
        let oOriginOfMove = {}
        oOriginOfMove.pieceId = oPieceView.dataset.modelId;
        const oParentNode = oPieceView ? oPieceView.parentNode : null;
        oOriginOfMove.originType = oParentNode ? (oParentNode.classList.contains('square') ? K.MOVE_FROM_TYPES.square : K.MOVE_FROM_TYPES.discard) : null;
        oOriginOfMove.originId = oPieceView ? oPieceView.parentNode.dataset.modelId : null;
        return oOriginOfMove;
    }

    static getListOfGameboardIds() {
        const aGameboardIds = [];
        aGameboardIds.push(K.GAMEBOARD_MAIN_ID);
        for (let i = 0; i < 1; i++) {
            aGameboardIds.push(`${K.GAMEBOARD_MINI_CLASS}-${i}`);
        }
        return aGameboardIds;
    }

    static killPiece(oModel, sSquareId) {
        const sPieceId = oModel.getPieceFromSquare(sSquareId);
        oModel.killPiece(sSquareId);
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            KnightsView.killPiece(sPieceId, sSquareId, sGameboardId);
        })
    }

    static updateChessboardMove(oModel, oOriginOfMove, oTargetOfMove) {
        if (oOriginOfMove.originType === K.MOVE_FROM_TYPES.square) {
            oModel.removePieceFromSquare(oOriginOfMove.originId);
        } else if (oOriginOfMove.originType === K.MOVE_FROM_TYPES.discard) {
            oModel.removePieceFromDiscard(oOriginOfMove);
        }
        if (oModel.isPieceOnSquare(oTargetOfMove.targetId)) {
            KnightsViewController.killPiece(oModel, oTargetOfMove.targetId);
        }
        oModel.putPieceOnSquare(oOriginOfMove.pieceId, oTargetOfMove.targetId);
        KnightsViewController.rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove);
    }

    static rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove) {
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            KnightsView.rerenderPieceOnChessboardMove(oOriginOfMove.originId, oOriginOfMove.originType, oOriginOfMove.pieceId, oTargetOfMove.targetId, sGameboardId);
        });
    }

    static transformGameboardToKnightbaseGame(oGameboard) {
        const oKnightbaseGame = JSON.stringify(oGameboard);
        return oKnightbaseGame;
    }

    static transformKnightbaseGameToGameboard(oKnightbaseGame) {
        const oGameboard = JSON.parse(oKnightbaseGame)
        return oGameboard;
    }

    setGameboard(oKnightbaseGame) {
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            this.clearPiecesFromChessboardView(this.model.getChessboard(), sGameboardId);
        })
        this.clearPiecesFromDiscardViewAndModel(this.model.getGameboard()[K.DISCARD_WHITE_ID], this.model.getGameboard()[K.DISCARD_BLACK_ID], K.GAMEBOARD_MAIN_ID);
        const oGameboard = KnightsViewController.transformKnightbaseGameToGameboard(oKnightbaseGame);
        this.model.setGameboard(oGameboard);
        aGameboardIds.forEach(sGameboardId => {
            this.renderPiecesOnChessboard(this.model.getChessboard(), sGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        });
        this.renderPiecesInDiscard(this.model.getGameboard()[K.DISCARD_WHITE_ID], this.model.getGameboard()[K.DISCARD_BLACK_ID]);
    }

    onPieceDragStart(oEvent) {
        const oTarget = oEvent.target;
        this.originOfMove = KnightsViewController.getMoveOriginFromPieceView(oTarget);
    }

    onDragoverPreventDefault(oEvent) {
        oEvent.preventDefault();
        this.currentTouchPageX = (oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches.item(0).pageX : -1;
        this.currentTouchPageY = (oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches.item(0).pageY : -1;
    }

    async onTouchEnd() {
        if (this.debug == true) KnightsView.clearDebugMessage();
        const nPageX = this.currentTouchPageX;
        const nPageY = this.currentTouchPageY;
        if (nPageX > -1 && nPageY > -1) {
            const sTargetOfMoveId = KnightsView.getTargetSquareViewIdFromXY(nPageX, nPageY);
            if (sTargetOfMoveId.length > 0) {
                this.targetOfMove.targetId = sTargetOfMoveId;
                KnightsViewController.updateChessboardMove(this.model, this.originOfMove, this.targetOfMove);
            }
            this.clearMovingPieces();
            await this.saveGame();
            this.currentTouchPageX = -1;
            this.currentTouchPageY = -1;
        }
    }

    async onSquareDrop(oEvent) {
        if (this.debug == true) KnightsView.clearDebugMessage();
        const oTarget = oEvent.target;
        let oSquareView = oTarget;
        if (oTarget && oTarget.classList.contains('piece')) {
            oSquareView = oTarget.parentNode;
        }
        if (oSquareView && oSquareView.classList.contains('square')) {
            this.targetOfMove.targetId = oSquareView ? oSquareView.dataset.modelId : 'none';
            KnightsViewController.updateChessboardMove(this.model, this.originOfMove, this.targetOfMove);
            this.clearMovingPieces();
            await this.saveGame();
        }
    }

    clearMovingPieces() {
        this.originOfMove = {};
        this.targetOfMove = {};
    }

    async saveGame() {
        KnightsView.renderDebugMessage(`in savegame, this.debug: '${this.debug}'`);
        const nGame = 0;
        const sUrl = `${this.knightbaseUrl}/${nGame}/save`;
        const oGameData = KnightsViewController.transformGameboardToKnightbaseGame(this.model.getGameboard());
        if (this.debug == true) KnightsView.renderDebugMessage('calling save game');
        const oPostOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: oGameData
        };
        const oResponse = await fetch(sUrl, oPostOptions);
    }

    async loadGame() {
        const nGame = 0;
        const sUrl = `${this.knightbaseUrl}/${nGame}/load`;

        const oGetOptions = {
            method: 'GET',
        };
        const oResponse = await fetch(sUrl, oGetOptions);
        if (oResponse.ok) {
            const sKnightbaseResponse = await oResponse.json();
            this.setGameboard(sKnightbaseResponse);
        }
    }

    getSquareIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex) {
        return `${K.aFiles[nFileIndex]}${nRankIndex + 1}`;
    }

    getPieceIdFromSquareId(sSquareId, oChessboard) {
        return oChessboard[sSquareId];
    }

    getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard) {
        return oChessboard[this.getSquareIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex)];
    }

    clearPiecesFromDiscardViewAndModel(aDiscardWhite, aDiscardBlack, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        for (let i = aDiscardBlack.length - 1; i >= 0; i--) {
            const sPieceId = `${aDiscardBlack[i]}-${K.GAMEBOARD_MAIN_ID}`;
            KnightsView.clearPieceFromDiscardView(sPieceId, K.DISCARD_BLACK_ID, sGameboardId);
            aDiscardBlack.splice(i, 1);
        }
        for (let i = aDiscardWhite.length - 1; i >= 0; i--) {
            const sPieceId = `${aDiscardWhite[i]}-${K.GAMEBOARD_MAIN_ID}`;
            KnightsView.clearPieceFromDiscardView(sPieceId, K.DISCARD_WHITE_ID, sGameboardId);
            aDiscardWhite.splice(i, 1);
        }
    }

    clearPiecesFromChessboardView(oChessboard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                const sSquareId = this.getSquareIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex);
                const sPieceId = this.getPieceIdFromSquareId(sSquareId, oChessboard);
                KnightsView.clearPieceFromChessboardView(sPieceId, sSquareId, sGameboardId);
            };
        }
    }

    renderPiecesInDiscard(aDiscardWhite, aDiscardBlack, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        for (let i = 0; i < aDiscardBlack.length; i++) {
            const sPieceId = aDiscardBlack[i];
            KnightsView.renderPieceInDiscard(sPieceId, K.DISCARD_BLACK_ID, sGameboardId);
        }
        for (let i = 0; i < aDiscardWhite.length; i++) {
            const sPieceId = aDiscardWhite[i];
            KnightsView.renderPieceInDiscard(sPieceId, K.DISCARD_WHITE_ID, sGameboardId);
        }
    }

    renderPiecesOnChessboard(oChessboard, sGameboardId, nGameboardRenderType) {
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sFile = K.aFiles[nFileIndex];
                let sPieceId = this.getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard);
                if (sPieceId.length > 0) {
                    KnightsView.renderPieceOnChessboard(sPieceId, nRank, sFile, sGameboardId, nGameboardRenderType);
                }
            }
        };
    }

    makePieces(oChessboard, sGameboardId = K.GAMEBOARD_MAIN_ID, oHandlers = {}) {
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sPieceId = this.getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard);
                KnightsView.makePiece(sPieceId, sGameboardId, oHandlers);
            };
        }
    }

    async start() {
        this.model.setupChessboard(K.CHESSBOARD_START);
        const oHandlers = {
            loadGame: this.loadGame.bind(this),
            onPieceDragStart: this.onPieceDragStart.bind(this),
            onDragoverPreventDefault: this.onDragoverPreventDefault.bind(this),
            onSquareDrop: this.onSquareDrop.bind(this),
            onTouchStart: this.onPieceDragStart.bind(this),
            onTouchMovePreventDefault: this.onDragoverPreventDefault.bind(this),
            onTouchEnd: this.onTouchEnd.bind(this)
        }
        KnightsView.makeGameboard(K.GAMEBOARD_MAIN_ID, K.GAMEBOARD_RENDER_TYPES.main, oHandlers);
        this.makePieces(this.model.getChessboard(), K.GAMEBOARD_MAIN_ID, oHandlers);
        let sMiniGameboardId = `${K.GAMEBOARD_MINI_CLASS}-${this.currentMiniGameboard}`;
        KnightsView.makeGameboard(sMiniGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        this.makePieces(this.model.getChessboard(), sMiniGameboardId);
        try {
            await this.loadGame();
        } catch (oError) {
            console.error(`error loading game: ${oError}`);
        }
        KnightsView.makeDebugView(this.debug == true);
        sMiniGameboardId = `${K.GAMEBOARD_MINI_CLASS}-1`;
        KnightsView.makeGameboard(sMiniGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        this.makePieces(this.model.getChessboard(), sMiniGameboardId);
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach((sGameboardId, nIndex) => {
            const nGameboardRenderType = nIndex == 0 ? K.GAMEBOARD_RENDER_TYPES.main : K.GAMEBOARD_RENDER_TYPES.mini;
            this.renderPiecesOnChessboard(this.model.getChessboard(), sGameboardId, nGameboardRenderType);
        });
    }
}

export { KnightsViewController };