let aChessboard = [];
const aFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

for (nRankIndex = 0; nRankIndex < 8; nRankIndex++) {
    let aRank = [];
    for (nFileIndex = 0; nFileIndex < 8; nFileIndex++) {
        aRank.push(undefined);
    }
    aChessboard.push(aRank);
}

const drawChessboard = function (aChessboard) {
    let oChessboardDiv = document.createElement('div');
    oChessboardDiv.id = 'chessboard';
    document.body.appendChild(oChessboardDiv);
    for (nRankIndex = 0; nRankIndex < 8; nRankIndex++) {
        let nRank = nRankIndex + 1;
        for (nFileIndex = 0; nFileIndex < 8; nFileIndex++) {
            let oDiv = document.createElement('div');
            let sFile = aFiles[nFileIndex];
            oDiv.classList.add('square');
            oDiv.id = `${sFile}${nRank}`;
            oChessboardDiv.appendChild(oDiv);
        };
    }
}

drawChessboard();