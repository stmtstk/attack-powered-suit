'use marked'
import { loadFromStorage  } from "./storage.js"

export function ask_openai(selectedText, usePromptSetting) {
    const ai_settings = loadFromStorage('ai_settings')

    const ret = ai_settings.then(
        result => onSuccessLoadFromStorage(result, selectedText, usePromptSetting),
        error => console.log(error),
    )
    return
}

async function onSuccessLoadFromStorage (settings, selectedText, usePromptSetting) {
    url.value = settings.url
    model.value = settings.model
    system_instruction.value = settings.system_instruction
    assistant_id.value = settings.assistant_id

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
    }

    let prompt = ''
    if (usePromptSetting) {
        prompt = settings.prompt.replaceAll("{text}", selectedText)
        OpenAIPrompt.value = prompt
    } else{
        prompt = OpenAIPrompt.value
    }

    //console.log(`prompt: ${prompt}`)
    ask_spinner.style.visibility = 'visible'
    if (settings.assistant_id.length == 0) {
        console.log(`Asked to ChatGPT: ${settings.model}`)
        fetch_open_ai_chat(settings, headers, prompt)
    } else{
        console.log(`Asked to assistant_id: ${settings.assistant_id}`)
        const assistant_info = await fetch_open_ai_assistant(settings, headers, prompt)
    }
    ask_spinner.style.visibility = 'hidden'
    return
}

async function fetch_open_ai_assistant (settings, headers, prompt) {
    headers['OpenAI-Beta'] = 'assistants=v1'

    // 1. create_thread
    const thread_id = await create_threads(settings, headers, prompt)
    //console.log(`thread_id: ${thread_id}`)

    // 2. Create Message
    const message_id = await create_message (headers, thread_id, prompt)
    //console.log(`message_id: ${message_id}`)

    // 3. Run the Thread
    const run_id = await run_thread(headers, thread_id, settings)
    //console.log(`run_id: ${run_id}`)

    // 4. wait
    await wait_run(headers, thread_id, run_id)

    // 5. Get Messages
    const raw = await get_messages(headers, thread_id)
    //console.log(`raw: ${raw}`)
    show_result(raw)
    return
}

async function create_threads (settings, headers, prompt) {
    const url = 'https://api.openai.com/v1/threads'
    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
        })
    const j = await resp.json()
    //console.log('j: ' + JSON.stringify(j, null, '\t'))
    return j['id']
}

async function  create_message (headers, thread_id, prompt) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/messages`
    //console.log(url)
    const payload = {
        'role': 'user',
        'content': prompt
    }
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))
    //console.log('headers: ' + JSON.stringify(headers, null, '\t'))

    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        })
    const j = await resp.json()
    //console.log('j: ' + JSON.stringify(j, null, '\t'))
    return j['id']

}

async function run_thread (headers, thread_id, settings) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/runs`
    //console.log(`url: ${url}`)
    const payload = {
        'assistant_id': settings.assistant_id
    }
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))
    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        })
    const j = await resp.json()
    return j['id']
}

async function wait_run (headers, thread_id, run_id) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`
    //console.log(`url: ${url}`)
    var is_complete = false

    while(!is_complete){
        const resp = await fetch(
            url,
            {
                method: 'GET',
                headers: headers,
        }    )
        const j = await resp.json()
        const status = j['status']
        //console.log(`status: ${status}`)
        if (status == 'completed') {
            //console.log('done')
            is_complete = true
        } else{
            //console.log('wait. 3secs')
            await new Promise(resolve => setTimeout(resolve, 3000))
        }
    }
    return
}

async function get_messages(headers, thread_id) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/messages`
    //console.log(`url: ${url}`)
    const resp = await fetch(
        url,
        {
            method: 'GET',
            headers: headers,
        })
    const j = await resp.json()
    //console.log('j: ' + JSON.stringify(j, null, '\t'))
    var value = null
    j['data'].forEach(function(data) {
        if(data['role'] != 'assistant'){
            return false
        }
        data['content'].forEach(function(content){
            if(content['type'] != 'text'){
                return false
            }
            value = content['text']['value']
            return true
        })
        if (value != null) {
            return true
        }
    })
    return value
}

function fetch_open_ai_chat (settings, headers, prompt) {
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
    }

    fetch(
        settings.url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        })
    .then(response => response.json())
    .then(data => {
        const raw = data.choices[0].message.content
       show_result(raw)
    })
    .catch(error => {
        console.error(`error: ${error}`)
        OpenAIResponse.value = error
    })
    return
}

function show_result(raw) {
    const html_content = marked.parse(raw)
    //console.info(`ChatGPT raw: ${raw}`)
    //console.info(`html : ${html_content}`)
    response.innerHTML = html_content
    return
}