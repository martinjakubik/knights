import { KnightsViewController } from './knightsViewController.js';
import { SettingsController } from './SettingsController.js';

const aSettings = [];
aSettings.push({ key: 'devMode', value: true })
const settingsController = new SettingsController(aSettings);
settingsController.renderSettings();

const oAppConfig = {
    protocol: 'https',
    hostname: 'www.supertitle.org',
    port: 2721,
};

if (window.location.hostname === 'localhost') {
    oAppConfig.protocol = 'http';
    oAppConfig.hostname = 'localhost';
    oAppConfig.port = 2003;
}

let oSearchParams = new URL(document.location).searchParams;
let bIsDebug = oSearchParams.get('debug') ? true : false;
if (oAppConfig.hostname != 'localhost' && bIsDebug) {
    console.log('debug mode');
    oAppConfig.port = 22721;
}

let oKnightsViewController = new KnightsViewController(oAppConfig);
oKnightsViewController.start();