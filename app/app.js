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
    debug: false
};

if (window.location.hostname === 'localhost') {
    oAppConfig.protocol = 'http';
    oAppConfig.hostname = 'localhost';
    oAppConfig.port = 2003;
}

let oSearchParams = new URL(document.location).searchParams;
let sDebugParam = oSearchParams.get('debug');
let bIsDebug = (sDebugParam === 'true') ? true : false;
if (oAppConfig.hostname != 'localhost' && bIsDebug) {
    oAppConfig.port = 22721;
    oAppConfig.debug = true;
}

let oKnightsViewController = new KnightsViewController(oAppConfig);
oKnightsViewController.start();