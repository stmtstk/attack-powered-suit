import { loadFromStorage  } from "./storage.js"

export function ask_openai(selectedText, usePromptSetting) {
    const ai_settings = loadFromStorage('ai_settings')

    const ret = ai_settings.then(
        result => onSuccessLoadFromStorage(result, selectedText, usePromptSetting),
        error => console.log(error),
    )
    return
}

function onSuccessLoadFromStorage (settings, selectedText, usePromptSetting) {
    url.value = settings.url
    model.value = settings.model
    system_introduction.value = settings.system_introduction

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
    };

    let prompt = ''
    if (usePromptSetting) {
        prompt = settings.prompt.replaceAll("{text}", selectedText);
        OpenAIPrompt.value = prompt
    } else{
        prompt = OpenAIPrompt.value
    }

    const requestBody = {
        model: settings.model,
        messages: [
            {
                role: 'system',
                content: system_introduction.value,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    };
    console.log(prompt)
    ask_spinner.style.visibility = 'visible'

    //OpenAIResponse.value = '送信完了'
    //return

    fetch(
        settings.url,
        {
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
