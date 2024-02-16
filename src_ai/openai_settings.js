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

export const settings = writable(defaultSettings)

export async function initializeAISettings() {
    const storedSettings = await loadFromStorage("ai_settings") ?? {}
    const newSettings = Object.assign({}, defaultSettings)

    for (const key of Object.keys(newSettings)) {
        if (storedSettings.hasOwnProperty(key)) {
            newSettings[key] = storedSettings[key]
        } else{
            newSettings[key] = defaultSettings[key]
        }
    }
    settings.set(newSettings)
    settings.subscribe(save)
    select_openai_model.value = newSettings.model
    select_openai_mode.value = newSettings.mode
    onChangeMode()
}


export function onChangeMode (){
    if (select_openai_mode.value == MODE_ASSISTANTS) {
        onChangeAssistant()
    } else if (select_openai_mode.value == MODE_CHAT) {
        onChangeChat()
    } 
    return
}

function onChangeChat () {
    setting_assistant_id.disabled = true
    select_openai_model.disabled = false
    setting_system_instructions.disabled = false
}

function onChangeAssistant () {
    setting_assistant_id.disabled = false
    select_openai_model.disabled = true
    setting_system_instructions.disabled = true
}

function save (newSettings) {
    saveToStorage("ai_settings", newSettings)
}
