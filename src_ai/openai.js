import { loadFromStorage  } from "./storage.js"

export function ask_openai(selected_text) {
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

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
    };

    const input_text = `${selectedText.value} に関連する MITRE ATT&CK Technique ID を Pickup してください`
    //console.info(input_text)

    const requestBody = {
        model: settings.model,
        messages: [
            {
                role: 'system',
                content: system_introduction.value,
            },
            {
                role: 'user',
                content: input_text,
            },
        ],
    };
    console.log(input_text)
    ask_spinner.style.visibility = 'visible'

    //OpenAIResponse.value = '送信完了'
    //return

    fetch(settings.url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        ask_spinner.style.visibility = 'hidden'
        console.info(data)
        const gen_text = data.choices[0].message.content
        console.info('ChatGPT gen_text:', gen_text)
        OpenAIResponse.value = gen_text
    })
    .catch(error => {
        console.error('error:', error)
        OpenAIResponse.value = error
    })
    return
}
