import { KnightsViewController } from './knightsViewController.js';

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