import { createDiv } from "learnhypertext";

class SettingsView {
    static render(aSettings) {
        const oSettingsList = createDiv('settings');
        aSettings.forEach((oSetting, nIndex) => {
            console.log(`key: ${oSetting.key} value: ${oSetting.value}`);
            const oSettingItem = createDiv(`settingItem${nIndex}`, oSettingsList);
            const sSettingKey = oSetting.key;
            const sSettingValue = oSetting.value;
            createDiv(`settingKey-${sSettingKey}`, oSettingItem);
            createDiv(`settingValue-${sSettingValue}`, oSettingItem);
        });
    }
}

export { SettingsView };