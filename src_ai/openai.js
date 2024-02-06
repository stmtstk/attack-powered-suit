import { loadFromStorage  } from "./storage.js"

export function startToTalk() {
    const ai_settings = loadFromStorage('ai_settings')

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
    //btn_start.disabled = false

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
    };
    console.log(headers)
    console.log(ai_settings)
    return
    /*

    const input_text = `${selection} に関連する MITRE ATT&CK Technique ID を Pickup してくだ>さい`
    console.info(input_text)
    const resp = 'some response'
    console.info(resp)
        const url = chrome.runtime.getURL(`ask_my_buddy.html?resp=${resp}`);
      console.info(url)
        chrome.tabs.create({ url });
    return
    const requestBody = {
        model:   chat_model,
        messages: [
            {
                role: 'system',
                content: system_introduction,
            },
            {
                role: 'user',
                content: input_text,
            },
        ],
    };

        fetch(api_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            console.info(data);
            console.info(data.choices);
            const gen_text = data.choices[0].message.content;
            console.info('ChatGPT gen_text:', gen_text);
        })
        .catch(error => console.error('error:', error));
    return
    */
}

