import { writable } from "svelte/store"
import { loadFromStorage, saveToStorage } from "./storage.js"
//import { select_multiple_value } from "svelte/internal"


export const MODE_ASSISTANTS = 'Assistants'
export const MODE_CHAT = 'Chat'
const DEFAULT_MODE = MODE_CHAT
const DEFAULT_NAME = 'No name'


const defaultSettings = {
    name: DEFAULT_NAME,
    mode: DEFAULT_MODE,
    api_key: "",
    model: "gpt-3.5-turbo",
    system_instructions: "You are a helpful assistant",
    prompt: "",
    assistant_id: ""
}

export let is_setting_ready = writable(false)

export const settings = writable(defaultSettings)

export async function initializeAISettings() {
    const storedSettings = await loadFromStorage("ai_settings") ?? []
    const newSettings = Object.assign([])

    for (const storedSetting of storedSettings) {
        let newSetting = Object.assign({}, defaultSettings)
        for (const key of Object.keys(storedSetting)) {
            if (storedSetting.hasOwnProperty(key)) {
                newSetting[key] = storedSetting[key]
            } else{
                newSetting[key] = defaultSettings[key]
            }
        }
        newSettings.push(newSetting)
    }
    settings.set(newSettings)
    settings.subscribe(save)
    is_setting_ready.set(true)
}


function save (newSettings) {
    saveToStorage("ai_settings", newSettings)
}
