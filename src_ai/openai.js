import { loadFromStorage  } from "./storage.js"

export function startToTalk() {
    console.log('Enter startToTalk')
    return
}

export function loadSettings(selected_text) {
    const ai_settings = loadFromStorage('ai_settings')

    const ret = ai_settings.then(
        result => onSuccessLoadFromStorage(result),
        error => console.log(error),
    )
    return
}

function onSuccessLoadFromStorage (settings) {
    url.value = settings.url
    model.value = settings.model
    system_introduction.value = settings.system_introduction
    btn_start.disabled = false
    return
}

