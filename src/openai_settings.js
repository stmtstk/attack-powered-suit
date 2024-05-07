import { writable } from "svelte/store";
import { loadFromStorage, saveToStorage } from "./storage.js";

export const modeAssistant = "Assistant";
export const modeChat = "Chat";
const defaultMode = modeChat;
const defaultName = "No name";

const defaultSettings = {
    name: defaultName,
    mode: defaultMode,
    api_key: "",
    model: "gpt-3.5-turbo",
    system_instructions: "You are a helpful assistant",
    prompt: "",
    assistant_id: "",
};

export let isSettingReady = writable(false);

export const settings = writable(defaultSettings);

export async function initializeAISettings() {
    const storedSettings = (await loadFromStorage("ai_settings")) ?? [];
    const newSettings = Object.assign([]);

    for (const storedSetting of storedSettings) {
        let newSetting = Object.assign({}, defaultSettings);
        for (const key of Object.keys(storedSetting)) {
            if (storedSetting.hasOwnProperty(key)) {
                newSetting[key] = storedSetting[key];
            } else {
                newSetting[key] = defaultSettings[key];
            }
        }
        newSettings.push(newSetting);
    }
    settings.set(newSettings);
    settings.subscribe(save);
    isSettingReady.set(true);
}

function save(newSettings) {
    saveToStorage("ai_settings", newSettings);
}
