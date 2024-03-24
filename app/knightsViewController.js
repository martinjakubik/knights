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

    static updateMoveFromSquareToSquare(oModel, oOriginOfMove, oTargetOfMove) {
        oModel.removePieceFromSquare(oOriginOfMove.originId);
        if (oModel.isPieceOnSquare(oTargetOfMove.targetId)) {
            KnightsViewController.killPiece(oModel, oTargetOfMove.targetId);
        }
        oModel.getChessboard()[oTargetOfMove.targetId] = oOriginOfMove.pieceId;
        KnightsViewController.rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove);
    }

    static updateMoveFromDiscardToSquare(oModel, oOriginOfMove, oTargetOfMove) {
        if (!oModel.isPieceOnSquare(oTargetOfMove.targetId)) {
            oModel.removePieceFromDiscard(oOriginOfMove);
            KnightsViewController.rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove);
        }
    }

    static updateChessboardMove(oModel, oOriginOfMove, oTargetOfMove) {
        if (oOriginOfMove.originType === K.MOVE_FROM_TYPES.square) {
            KnightsViewController.updateMoveFromSquareToSquare(oModel, oOriginOfMove, oTargetOfMove);
        } else if (oOriginOfMove.originType === K.MOVE_FROM_TYPES.discard) {
            KnightsViewController.updateMoveFromDiscardToSquare(oModel, oOriginOfMove, oTargetOfMove);
        }
    }

    static rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove) {
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            const sOriginOfMoveIdOnGameboard = `${oOriginOfMove.originId}-${sGameboardId}`;
            const sPieceIdOnGameboard = `${oOriginOfMove.pieceId}-${sGameboardId}`;
            const sTargetOfMoveIdOnGameboard = `${oTargetOfMove.targetId}-${sGameboardId}`;
            const oMovedFromNode = document.getElementById(sOriginOfMoveIdOnGameboard);
            const oMovedPieceNode = document.getElementById(sPieceIdOnGameboard);
            const oMovedToNode = document.getElementById(sTargetOfMoveIdOnGameboard);
            if (oMovedFromNode && oMovedPieceNode && oMovedToNode) {
                oMovedFromNode.removeChild(oMovedPieceNode);
                oMovedToNode.appendChild(oMovedPieceNode);
            }
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
        this.clearPiecesFromChessboardView(this.model.getChessboard());
        this.clearPiecesFromDiscardViewAndModel(this.model.getGameboard()[K.WHITE_DISCARD_ID], this.model.getGameboard()[K.BLACK_DISCARD_ID]);
        const oGameboard = KnightsViewController.transformKnightbaseGameToGameboard(oKnightbaseGame);
        this.model.setGameboard(oGameboard);
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            this.renderPiecesOnChessboard(this.model.getChessboard(), sGameboardId);
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

    onSquareDrop(oEvent) {
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
        }
    }

    clearMovingPieces() {
        this.originOfMove = {};
        this.targetOfMove = {};
    }

    saveGame = async function () {
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

    loadGame = async function () {
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

    clearPiecesFromDiscardViewAndModel(aWhiteDiscard, aBlackDiscard) {
        for (let i = aWhiteDiscard.length - 1; i >= 0; i--) {
            const sPieceId = `${aWhiteDiscard[i]}-${K.GAMEBOARD_MAIN_ID}`;
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.removeEventListener('dragstart', this.onPieceDragStart.bind(this));
            oPieceView.removeEventListener('touchstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(K.WHITE_DISCARD_ID);
            oDiscardViewForPiece.removeChild(oPieceView);
            document.body.appendChild(oPieceView);
            aWhiteDiscard.splice(i, 1);
        }
        for (let i = aBlackDiscard.length - 1; i >= 0; i--) {
            const sPieceId = `${aBlackDiscard[i]}-${K.GAMEBOARD_MAIN_ID}`;
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.removeEventListener('dragstart', this.onPieceDragStart.bind(this));
            oPieceView.removeEventListener('touchstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(K.BLACK_DISCARD_ID);
            oDiscardViewForPiece.removeChild(oPieceView);
            document.body.appendChild(oPieceView);
            aBlackDiscard.splice(i, 1);
        }
    }

    clearPiecesFromChessboardView(oChessboard) {
        const aGameboardIds = KnightsViewController.getListOfGameboardIds();
        aGameboardIds.forEach(sGameboardId => {
            for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
                let nRank = nRankIndex + 1;
                for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                    let sFile = K.aFiles[nFileIndex];
                    let sPieceId = oChessboard[`${sFile}${nRank}`];
                    const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
                    if (sPieceId.length > 0) {
                        let oPieceView = document.getElementById(sPieceIdOnGameboard);
                        oPieceView.removeEventListener('dragstart', this.onPieceDragStart.bind(this));
                        oPieceView.removeEventListener('touchstart', this.onPieceDragStart.bind(this));
                        const sSquareId = `${sFile}${nRank}`;
                        const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
                        let oSquareView = document.getElementById(sSquareIdOnGameboard);
                        oSquareView.removeChild(oPieceView);
                        document.body.appendChild(oPieceView);
                    }
                };
            }
        });
    }

    renderPiecesInDiscard(aWhiteDiscard, aBlackDiscard) {
        for (let i = 0; i < aWhiteDiscard.length; i++) {
            const sPieceId = aWhiteDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
            oPieceView.addEventListener('touchstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(K.WHITE_DISCARD_ID);
            oDiscardViewForPiece.appendChild(oPieceView);
        }
        for (let i = 0; i < aBlackDiscard.length; i++) {
            const sPieceId = aBlackDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
            oPieceView.addEventListener('touchstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(K.BLACK_DISCARD_ID);
            oDiscardViewForPiece.appendChild(oPieceView);
        }
    }

    renderPiecesOnChessboard(oChessboard, sGameboardId, nGameboardRenderType) {
        let nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        if (nGameboardRenderType === K.GAMEBOARD_RENDER_TYPES.mini) {
            nMaximumBoardWidth = K.GAMEBOARD_MINI_WIDTH;
        }
        let oPieceView;
        const nSquareSize = nMaximumBoardWidth / K.NUM_RANKS;
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sFile = K.aFiles[nFileIndex];
                let sPieceId = oChessboard[`${sFile}${nRank}`];
                if (sPieceId.length > 0) {
                    const sPieceIdOnGameboard = `${sPieceId}-${sGameboardId}`;
                    oPieceView = document.getElementById(sPieceIdOnGameboard);
                    oPieceView.style.width = nSquareSize + K.STYLE_PX;
                    oPieceView.style.height = nSquareSize + K.STYLE_PX;
                    oPieceView.draggable = true;
                    oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
                    oPieceView.addEventListener('touchstart', this.onPieceDragStart.bind(this));
                    oPieceView.addEventListener('touchend', this.onTouchEnd.bind(this));
                    const sSquareId = `${sFile}${nRank}`;
                    const sSquareIdOnGameboard = `${sSquareId}-${sGameboardId}`;
                    let oSquareView = document.getElementById(sSquareIdOnGameboard);
                    oSquareView.appendChild(oPieceView);
                }
            };
        }
    }

    makePieces(oChessboard, sGameboardId = K.GAMEBOARD_MAIN_ID) {
        for (let nRankIndex = K.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < K.NUM_FILES; nFileIndex++) {
                let sFile = K.aFiles[nFileIndex];
                let sPieceId = oChessboard[`${sFile}${nRank}`];
                if (sPieceId.length > 0) {
                    let sPieceClass = sPieceId.substring(0, 2);
                    let oPieceView = document.createElement('div');
                    oPieceView.id = `${sPieceId}-${sGameboardId}`;
                    oPieceView.dataset.modelId = sPieceId;
                    oPieceView.classList.add('piece');
                    oPieceView.classList.add(sPieceClass);
                    document.body.appendChild(oPieceView);
                }
            };
        }
    }

    start() {
        this.model.setupChessboard(K.CHESSBOARD_START);
        const oHandlers = {
            saveGame: this.saveGame.bind(this),
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