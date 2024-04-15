import { KnightsViewController } from './knightsViewController.js';
import { SettingsController } from '../lib/SettingsController.js';

const aSettings = [];
aSettings.push({ key: 'devMode', value: true })
this.settingsController = new SettingsController(aSettings);
this.settingsController.renderSettings();

const oAppConfig = {
    protocol: 'https',
    domain: 'www.supertitle.org',
    port: 2721,
};

if (window.location.hostname === 'localhost') {
    oAppConfig.protocol = 'http';
    oAppConfig.hostname = 'localhost';
    oAppConfig.port = 2003;
}

let oKnightsViewController = new KnightsViewController(oAppConfig);
oKnightsViewController.start();