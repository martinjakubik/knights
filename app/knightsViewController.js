import { KnightsView } from './knightsView.js';
import { KnightsModel } from './knightsModel.js';
import * as K from './knightsConstants.js';

class KnightsViewController {
    sKnightbaseUrl = 'https://www.supertitle.org:2721/knightbase';
    model = {};

    constructor() {
        this.model = new KnightsModel();
        this.originOfMove = {};
        this.targetOfMove = {};
        this.currentTouchPageX = -1;
        this.currentTouchPageY = -1;
        this.currentMiniGameboard = 0;
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
            const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
            const oSquareView = document.getElementById(sSquareIdOnGameboard);
            const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
            const oPieceView = document.getElementById(sPieceIdOnGameboard);
            if (oSquareView && oPieceView) {
                oSquareView.removeChild(oPieceView);
            }
            const sDiscardAreaForPieceId = sPieceIdOnGameboard.substring(0, 1);
            const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? K.BLACK_DISCARD_ID : K.WHITE_DISCARD_ID;
            const sDiscardAreaOnGameboard = `${sDiscardAreaForPiece}-${sGameboardId}`;
            const oDiscardViewForPiece = document.getElementById(sDiscardAreaOnGameboard);
            oDiscardViewForPiece.appendChild(oPieceView);
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
            KnightsView.rerenderPieceOnChessboardMove(oOriginOfMove.originId, oOriginOfMove.pieceId, oOriginOfMove.targetId, sGameboardId);
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
        this.clearPiecesFromDiscardViewAndModel(this.model.getGameboard()[K.WHITE_DISCARD_ID], this.model.getGameboard()[K.BLACK_DISCARD_ID], K.GAMEBOARD_MAIN_ID);
        const oGameboard = KnightsViewController.transformKnightbaseGameToGameboard(oKnightbaseGame);
        this.model.setGameboard(oGameboard);
        aGameboardIds.forEach(sGameboardId => {
            this.renderPiecesOnChessboard(this.model.getChessboard(), sGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        });
        this.renderPiecesInDiscard(this.model.getGameboard()[K.WHITE_DISCARD_ID], this.model.getGameboard()[K.BLACK_DISCARD_ID]);
    }

    onPieceDragStart(oEvent) {
        const oTarget = oEvent.target;
        this.originOfMove = KnightsViewController.getMoveOriginFromPieceView(oTarget);
        console.log(`moving piece '${this.originOfMove.pieceId}' from ${this.originOfMove.originId}`);
    }

    onDragoverPreventDefault(oEvent) {
        oEvent.preventDefault();
        this.currentTouchPageX = (oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches.item(0).pageX : -1;
        this.currentTouchPageY = (oEvent.touches && oEvent.touches.length > 0) ? oEvent.touches.item(0).pageY : -1;
    }

    onTouchEnd() {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        const nPageX = this.currentTouchPageX;
        const nPageY = this.currentTouchPageY;
        if (nPageX > -1 && nPageY > -1) {
            const nFileIndex = Math.floor(nPageX / nSquareSize + K.GAMEBOARD_PIXEL_PADDING) - 2;
            const sFile = K.aFiles[nFileIndex];
            const nRankIndex = 8 - Math.floor(nPageY / nSquareSize);
            const sRank = nRankIndex;
            const sSquareId = `${sFile}${sRank}`;
            const sSquareIdOnMainGameboard = `${sSquareId}-${K.GAMEBOARD_MAIN_ID}`;
            let oSquareView = document.getElementById(sSquareIdOnMainGameboard);
            if (oSquareView && oSquareView.classList.contains('square')) {
                const sTargetOfMoveId = oSquareView ? oSquareView.dataset.modelId : 'none';
                this.targetOfMove.targetId = sTargetOfMoveId;
                console.log(`moved piece '${this.originOfMove.pieceId}' from ${this.originOfMove.originId} to ${this.targetOfMove.targetId}`);
                KnightsViewController.updateChessboardMove(this.model, this.originOfMove, this.targetOfMove);
                this.clearMovingPieces();
            }
            this.currentTouchPageX = -1;
            this.currentTouchPageY = -1;
        }
    }

    async onSquareDrop(oEvent) {
        const oTarget = oEvent.target;
        let oSquareView = oTarget;
        if (oTarget && oTarget.classList.contains('piece')) {
            oSquareView = oTarget.parentNode;
        }
        if (oSquareView && oSquareView.classList.contains('square')) {
            this.targetOfMove.targetId = oSquareView ? oSquareView.dataset.modelId : 'none';
            console.log(`moved piece '${this.originOfMove.pieceId}' from ${this.originOfMove.originId} to ${this.targetOfMove.targetId}`);
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
        const nGame = 0;
        const sUrl = `${this.sKnightbaseUrl}/${nGame}/save`;
        const oFormBody = new URLSearchParams();
        const oKnightbaseGame = KnightsViewController.transformGameboardToKnightbaseGame(this.model.getGameboard());
        oFormBody.set('game', oKnightbaseGame);

        const oPostOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: oFormBody
        };
        const oResponse = await fetch(sUrl, oPostOptions);
    }

    async loadGame() {
        const nGame = 0;
        const sUrl = `${this.sKnightbaseUrl}/${nGame}/load`;

        const oGetOptions = {
            method: 'GET',
        };
        const oResponse = await fetch(sUrl, oGetOptions);
        if (oResponse.ok) {
            const sKnightbaseResponse = await oResponse.json();
            this.setGameboard(sKnightbaseResponse);
        }
    }

    getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard) {
        return oChessboard[`${K.aFiles[nFileIndex]}${nRankIndex + 1}`];
    }

    clearPiecesFromDiscardViewAndModel(aWhiteDiscard, aBlackDiscard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        const oHandlers = {
            onPieceDragStart: this.onPieceDragStart.bind(this),
            onTouchStart: this.onPieceDragStart.bind(this)
        };
        for (let i = aBlackDiscard.length - 1; i >= 0; i--) {
            const sPieceId = `${aBlackDiscard[i]}-${K.GAMEBOARD_MAIN_ID}`;
            KnightsView.clearPieceFromDiscardView(sPieceId, K.BLACK_DISCARD_ID, sGameboardId, oHandlers);
            aBlackDiscard.splice(i, 1);
        }
        for (let i = aWhiteDiscard.length - 1; i >= 0; i--) {
            const sPieceId = `${aWhiteDiscard[i]}-${K.GAMEBOARD_MAIN_ID}`;
            KnightsView.clearPieceFromDiscardView(sPieceId, K.WHITE_DISCARD_ID, sGameboardId, oHandlers);
            aWhiteDiscard.splice(i, 1);
        }
    }

    clearPiecesFromChessboardView(oChessboard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        const oHandlers = {
            onPieceDragStart: this.onPieceDragStart.bind(this),
            onTouchStart: this.onPieceDragStart.bind(this)
        };
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sPieceId = this.getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard);
                KnightsView.clearPieceFromChessboardView(sPieceId, sGameboardId, oHandlers);
            };
        }
    }

    renderPiecesInDiscard(aWhiteDiscard, aBlackDiscard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        const oHandlers = {
            onPieceDragStart: this.onPieceDragStart.bind(this),
            onTouchStart: this.onPieceDragStart.bind(this)
        };
        for (let i = 0; i < aBlackDiscard.length; i++) {
            const sPieceId = aBlackDiscard[i];
            KnightsView.renderPieceInDiscard(sPieceId, K.BLACK_DISCARD_ID, sGameboardId, oHandlers);
        }
        for (let i = 0; i < aWhiteDiscard.length; i++) {
            const sPieceId = aWhiteDiscard[i];
            KnightsView.renderPieceInDiscard(sPieceId, K.WHITE_DISCARD_ID, sGameboardId, oHandlers);
        }
    }

    renderPiecesOnChessboard(oChessboard, sGameboardId, nGameboardRenderType) {
        const oHandlers = {
            onPieceDragStart: this.onPieceDragStart.bind(this),
            onTouchStart: this.onPieceDragStart.bind(this),
            onTouchEnd: this.onTouchEnd.bind(this)
        };
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sFile = K.aFiles[nFileIndex];
                let sPieceId = this.getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard);
                if (sPieceId.length > 0) {
                    KnightsView.renderPieceOnChessboard(sPieceId, nRank, sFile, sGameboardId, nGameboardRenderType, oHandlers);
                }
            }
        };
    }

    makePieces(oChessboard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sPieceId = this.getPieceIdFromRankIndexAndFileIndex(nRankIndex, nFileIndex, oChessboard);
                KnightsView.makePiece(sPieceId, sGameboardId);
            };
        }
    }

    async start() {
        this.model.setupChessboard(K.CHESSBOARD_START);
        const oHandlers = {
            loadGame: this.loadGame.bind(this),
            onDragoverPreventDefault: this.onDragoverPreventDefault.bind(this),
            onTouchMovePreventDefault: this.onDragoverPreventDefault.bind(this),
            onSquareDrop: this.onSquareDrop.bind(this),
            onTouchEnd: this.onTouchEnd.bind(this)
        }
        KnightsView.makeGameboard(K.GAMEBOARD_MAIN_ID, K.GAMEBOARD_RENDER_TYPES.main, oHandlers);
        let sMiniGameboardId = `${K.GAMEBOARD_MINI_CLASS}-${this.currentMiniGameboard}`;
        this.makePieces(this.model.getChessboard());
        KnightsView.makeGameboard(sMiniGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        try {
            await this.loadGame();
        } catch (oError) {
            console.error(`error loading game: ${oError}`);
        }
        this.makePieces(this.model.getChessboard(), sMiniGameboardId);
        sMiniGameboardId = `${K.GAMEBOARD_MINI_CLASS}-1`;
        KnightsView.makeGameboard(sMiniGameboardId, K.GAMEBOARD_RENDER_TYPES.mini);
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach((sGameboardId, nIndex) => {
            const nGameboardRenderType = nIndex == 0 ? K.GAMEBOARD_RENDER_TYPES.main : K.GAMEBOARD_RENDER_TYPES.mini;
            this.renderPiecesOnChessboard(this.model.getChessboard(), sGameboardId, nGameboardRenderType);
        });
    }
}

export { KnightsViewController };