"use strict";

const { stringToCamelCase } = require("./helpers.js");

const mainLanguageDependentText = {
    settingsButton: {
        en: "Settings",
        tr: "Ayarlar",
    },
    aboutButton: {
        en: "About",
        tr: "Hakkında",
    },
    asrEngineSelectorLabel: {
        en: "ASR Engine",
        tr: "ASR Motoru",
    },
    asrModelSelectorLabel: {
        en: "ASR Model",
        tr: "ASR Modeli",
    },
    uploadedFileLabel: {
        en: "Upload File",
        tr: "Dosya Yükle",
    },
    configurationButton: {
        en: "Configuration",
        tr: "Konfigürasyon",
    },
    startButton: {
        en: "Start",
        tr: "Başlat",
    },
    stopButton: {
        en: "Stop",
        tr: "Durdur",
    },
    clearButton: {
        en: "Clear",
        tr: "Temizle",
    },
    copyButton: {
        en: "Copy",
        tr: "Kopyala",
    },
    darkModeLabel: {
        en: "Dark Mode",
        tr: "Karanlık Mod",
    },
    languageLabel: {
        en: "Language",
        tr: "Dil",
    },
    settingsSaveButton: {
        en: "Save",
        tr: "Kaydet",
    },
    settingsExitButton: {
        en: "Exit",
        tr: "Çıkış",
    },
    configurationSaveButton: {
        en: "Save",
        tr: "Kaydet",
    },
    configurationExitButton: {
        en: "Exit",
        tr: "Çıkış",
    },
};

const dialogLanguageData = {
    noFileSelected: {
        en: "No file selected!",
        tr: "Lütfen bir dosya seçiniz!",
    },
    unsupportedFile: {
        en: "File type is not supported!",
        tr: "Dosya türü desteklenmiyor!",
    },
    noChanges: {
        en: "No changes to save!",
        tr: "Kaydedilecek bir değişiklik bulunamadı!",
    },
    noFileFound: {
        en: "No file found!",
        tr: "Dosya bulunamadı!",
    },
    settingsChangedDialogTitle: {
        en: "Settings",
        tr: "Ayarlar",
    },
    settingsChangedDialogMessage: {
        en: "Do you want to restart the application?",
        tr: "Uygulamayı yeniden başlatmak istiyor musunuz?",
    },
    settingsChangedDialogButtons: {
        en: ["Yes", "No"],
        tr: ["Evet", "Hayır"],
    },
};

class Localizer {
    constructor(languageId = "en") {
        this.setLanguage(languageId);
    }

    setLanguage(languageId) {
        this.languageId = languageId;
    }

    localize(id) {
        id = stringToCamelCase(id);
        const stringData = mainLanguageDependentText[id];
        if (stringData) {
            return stringData[this.languageId] || stringData["en"];
        }
        return "";
    }

    localizeDialog(id) {
        return dialogLanguageData[id][this.languageId] || dialogLanguageData[id]["en"];
    }

    updateUIText(id) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = this.localize(id);
        }
    }
}

module.exports = {
    Localizer,
};
