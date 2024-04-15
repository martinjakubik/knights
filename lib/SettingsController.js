import SettingsView from SettingsView;

class SettingsController {
    constructor(aSettings) {
        this.aSettings = aSettings;
    }

    renderSettings() {
        this.aSettings.forEach(oSetting => {
            console.log(`key: ${oSetting.key} value: ${oSetting.value}`);
        })
        SettingsView.renderSettings(this.aSettings);
    }
}