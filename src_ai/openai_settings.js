import { writable } from "svelte/store"
import { loadFromStorage, saveToStorage } from "./storage.js"

const defaultSettings = {
    api_key: "",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",
    system_introduction: "You are a helpful assistant",
}

export const settings = writable(defaultSettings)

export async function initializeAISettings() {
    const storedSettings = await loadFromStorage("ai_settings") ?? {}
    const newSettings = Object.assign({}, defaultSettings)

    for (const key of Object.keys(newSettings)) {
        if (settings.hasOwnProperty(key)) {
            newSettings[key] = storedSettings[key]
        }
    }
    settings.set(newSettings)
    settings.subscribe(save)
}

function save (newSettings) {
    saveToStorage("ai_settings", newSettings)
}