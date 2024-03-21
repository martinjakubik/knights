import { KnightsView } from './knightsView.js';
import { KnightsModel } from './knightsModel.js';
import * as KnightsConstants from './knightsConstants.js';

class KnightsViewController {
    sKnightbaseUrl = 'https://www.supertitle.org:2721/knightbase';
    model = {};

    constructor() {
        this.model = new KnightsModel();
        this.originOfMove = {};
        this.targetOfMove = {};
    }

    static getMoveOriginFromPieceView(oPieceView) {
        let oOriginOfMove = {}
        oOriginOfMove.pieceId = oPieceView.id;
        const oParentNode = oPieceView ? oPieceView.parentNode : null;
        oOriginOfMove.originId = oPieceView ? oPieceView.parentNode.id : null;
        oOriginOfMove.originType = oParentNode ? (oParentNode.classList.contains('square') ? 0 : 1) : null;
        return oOriginOfMove;
    }

    onPieceDragStart(oEvent) {
        const oTarget = oEvent.target;
        this.originOfMove = KnightsViewController.getMoveOriginFromPieceView(oTarget);
        console.log(`moving piece '${this.originOfMove.pieceId}' from ${this.originOfMove.originId}`);
    }

    onDragoverPreventDefault(oEvent) {
        oEvent.preventDefault();
    }

    onSquareDrop(oEvent) {
        const oTarget = oEvent.target;
        let oSquareView = oTarget;
        if (oTarget && oTarget.classList.contains('piece')) {
            oSquareView = oTarget.parentNode;
        }
        if (oSquareView && oSquareView.classList.contains('square')) {
            this.targetOfMove.targetId = oSquareView ? oSquareView.id : 'none';
            console.log(`moved piece '${this.originOfMove.pieceId}' from ${this.originOfMove.originId} to ${this.targetOfMove.targetId}`);
            KnightsViewController.updateChessboardMove(this.model, this.originOfMove, this.targetOfMove);
            this.clearMovingPieces();
        }
    }

    clearMovingPieces() {
        this.originOfMove = {};
        this.targetOfMove = {};
    }

    static killPiece(oModel, sSquareId) {
        const oSquareView = document.getElementById(sSquareId);
        const sPieceId = oModel.getPieceFromSquare(sSquareId);
        const oPieceView = document.getElementById(sPieceId);
        if (oSquareView && oPieceView) {
            oSquareView.removeChild(oPieceView);
        }
        if (sPieceId) {
            const sDiscardAreaForPieceId = sPieceId.substring(0, 1);
            const sDiscardAreaForPiece = sDiscardAreaForPieceId === 'b' ? KnightsConstants.BLACK_DISCARD : KnightsConstants.WHITE_DISCARD;
            const oDiscardViewForPiece = document.getElementById(sDiscardAreaForPiece);
            oDiscardViewForPiece.appendChild(oPieceView);
            oModel.killPiece(sSquareId);
        }
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
        if (oOriginOfMove.originType == 0) {
            KnightsViewController.updateMoveFromSquareToSquare(oModel, oOriginOfMove, oTargetOfMove);
        } else {
            KnightsViewController.updateMoveFromDiscardToSquare(oModel, oOriginOfMove, oTargetOfMove);
        }
    }

    static rerenderPiecesOnChessboardMove(oOriginOfMove, oTargetOfMove) {
        const oMovedFromNode = document.getElementById(oOriginOfMove.originId);
        const oMovedPieceNode = document.getElementById(oOriginOfMove.pieceId);
        const oMovedToNode = document.getElementById(oTargetOfMove.targetId);
        if (oMovedFromNode && oMovedPieceNode && oMovedToNode) {
            oMovedFromNode.removeChild(oMovedPieceNode);
            oMovedToNode.appendChild(oMovedPieceNode);
        }
    }

    transformGameboardToKnightbaseGame(oGameboard) {
        const oKnightbaseGame = JSON.stringify(oGameboard);
        return oKnightbaseGame;
    }

    transformKnightbaseGameToGameboard(oKnightbaseGame) {
        this.clearPiecesFromChessboardView(this.model.getChessboard());
        this.clearPiecesFromDiscardViewAndModel(this.model.getGameboard()[KnightsConstants.WHITE_DISCARD], this.model.getGameboard()[KnightsConstants.BLACK_DISCARD]);
        this.model.setGameboard(JSON.parse(oKnightbaseGame));
        this.renderPiecesOnChessboard(this.model.getChessboard());
        this.renderPiecesInDiscard(this.model.getGameboard()[KnightsConstants.WHITE_DISCARD], this.model.getGameboard()[KnightsConstants.BLACK_DISCARD]);
    }

    saveGame = async function () {
        const nGame = 0;
        const sUrl = `${this.sKnightbaseUrl}/${nGame}/save`;
        const oFormBody = new URLSearchParams();
        const oKnightbaseGame = this.transformGameboardToKnightbaseGame(this.model.getGameboard());
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
            this.transformKnightbaseGameToGameboard(sKnightbaseResponse);
        }
    }

    clearPiecesFromDiscardViewAndModel(aWhiteDiscard, aBlackDiscard) {
        for (let i = aWhiteDiscard.length - 1; i >= 0; i--) {
            const sPieceId = aWhiteDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.removeEventListener('dragstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(KnightsConstants.WHITE_DISCARD);
            oDiscardViewForPiece.removeChild(oPieceView);
            document.body.appendChild(oPieceView);
            aWhiteDiscard.splice(i, 1);
        }
        for (let i = aBlackDiscard.length - 1; i >= 0; i--) {
            const sPieceId = aBlackDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.removeEventListener('dragstart', this.onPieceDragStart);
            const oDiscardViewForPiece = document.getElementById(KnightsConstants.BLACK_DISCARD);
            oDiscardViewForPiece.removeChild(oPieceView);
            document.body.appendChild(oPieceView);
            aBlackDiscard.splice(i, 1);
        }
    }

    clearPiecesFromChessboardView(oChessboard) {
        for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let sFile = KnightsConstants.aFiles[nFileIndex];
                let sPieceId = oChessboard[`${sFile}${nRank}`];
                if (sPieceId.length > 0) {
                    let oPieceView = document.getElementById(sPieceId);
                    oPieceView.removeEventListener('dragstart', this.onPieceDragStart.bind(this));
                    let oSquareView = document.getElementById(`${sFile}${nRank}`);
                    oSquareView.removeChild(oPieceView);
                    document.body.appendChild(oPieceView);
                }
            };
        }
    }

    renderPiecesInDiscard(aWhiteDiscard, aBlackDiscard) {
        for (let i = 0; i < aWhiteDiscard.length; i++) {
            const sPieceId = aWhiteDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(KnightsConstants.WHITE_DISCARD);
            oDiscardViewForPiece.appendChild(oPieceView);
        }
        for (let i = 0; i < aBlackDiscard.length; i++) {
            const sPieceId = aBlackDiscard[i];
            let oPieceView = document.getElementById(sPieceId);
            oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
            const oDiscardViewForPiece = document.getElementById(KnightsConstants.BLACK_DISCARD);
            oDiscardViewForPiece.appendChild(oPieceView);
        }
    }

    renderPiecesOnChessboard(oChessboard) {
        const nMaximumBoardWidth = KnightsView.getMaximumBoardDisplaySize();
        const nSquareSize = nMaximumBoardWidth / KnightsConstants.NUM_RANKS;
        for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let sFile = KnightsConstants.aFiles[nFileIndex];
                let sPieceId = oChessboard[`${sFile}${nRank}`];
                if (sPieceId.length > 0) {
                    let oPieceView = document.getElementById(sPieceId);
                    oPieceView.style.width = nSquareSize + KnightsConstants.STYLE_PX;
                    oPieceView.style.height = nSquareSize + KnightsConstants.STYLE_PX;
                    oPieceView.draggable = true;
                    oPieceView.addEventListener('dragstart', this.onPieceDragStart.bind(this));
                    let oSquareView = document.getElementById(`${sFile}${nRank}`);
                    oSquareView.appendChild(oPieceView);
                }
            };
        }
    }

    makePieces(oChessboard) {
        for (let nRankIndex = KnightsConstants.NUM_RANKS - 1; nRankIndex >= 0; nRankIndex--) {
            let nRank = nRankIndex + 1;
            for (let nFileIndex = 0; nFileIndex < KnightsConstants.NUM_FILES; nFileIndex++) {
                let sFile = KnightsConstants.aFiles[nFileIndex];
                let sPieceId = oChessboard[`${sFile}${nRank}`];
                let sPieceClass = sPieceId.substring(0, 2);
                if (sPieceId.length > 0) {
                    let oPieceView = document.createElement('div');
                    oPieceView.id = sPieceId;
                    oPieceView.classList.add('piece');
                    oPieceView.classList.add(sPieceClass);
                    document.body.appendChild(oPieceView);
                }
            };
        }
    }

    start() {
        this.model.setupChessboard(KnightsConstants.CHESSBOARD_START);
        KnightsView.makeGameboard({
            saveGame: this.saveGame.bind(this),
            loadGame: this.loadGame.bind(this),
            onDragoverPreventDefault: this.onDragoverPreventDefault.bind(this),
            onSquareDrop: this.onSquareDrop.bind(this)
        });
        this.makePieces(this.model.getChessboard());
        this.renderPiecesOnChessboard(this.model.getChessboard());
    }
}

export { KnightsViewController };