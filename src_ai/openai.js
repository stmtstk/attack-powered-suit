'use marked';
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
    system_instruction.value = settings.system_instruction

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
                content: system_instruction.value,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    };
    console.log(prompt)
    ask_spinner.style.visibility = 'visible'

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
        //console.info(data)
        const raw = data.choices[0].message.content
        const html_content = marked.parse(raw)
        //console.info('ChatGPT raw:', raw)
        //console.info('html :', html_content)
        response.innerHTML = html_content
    })
    .catch(error => {
        console.error('error:', error)
        OpenAIResponse.value = error
    })
    return
}
