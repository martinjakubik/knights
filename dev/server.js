import express from 'express';
import * as oHttps from 'http';
import * as oProcess from 'process';
import { knightservice } from './localknightservice.js';


let bDebug = false;
process.argv.forEach(function (sValue, index, array) {
    if (sValue === '-d' || sValue === '--debug') {
        bDebug = true;
    }
});

const app = express();

let nPort = process.env.PORT || 2003;

const bProductionEnv = oProcess.env.NODE_ENV;

app.use(express.json());

app.use(express.static('app'))

app.post('/knightbase/:game/save', (oRequest, oResponse) => {
    if (bDebug) console.log('supertitle post');
    if (bDebug) console.log(`strigified request: ${JSON.stringify(oRequest.body)} `);
    let bValid = false;
    const nGame = oRequest.params.game;
    const oGame = oRequest.body;
    if (nGame && oGame && nGame >= 0 && nGame <= 99) {
        bValid = knightservice.validateKnightsData(oGame, bDebug);
    }
    if (bValid) {
        const sGame = JSON.stringify(oGame);
        knightservice.save(nGame, sGame, bDebug);
        oResponse.send(`game ${nGame} saved`);
    } else {
        oResponse.send(`failed to save game '${nGame}'`);
    }
})

app.get('/knightbase/:game/load', (oRequest, oResponse) => {
    const nGame = oRequest.params.game;
    knightservice.load(nGame, oResponse, bDebug);
});

const oHttpsServer = oHttps.createServer(app);

oHttpsServer.listen(process.env.PORT || nPort);

console.log(`listening on port '${nPort}'`);
