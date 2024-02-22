import { marked } from 'marked';
import { writable } from "svelte/store"
import { loadFromStorage  } from "./storage.js"
import { MODE_CHAT, MODE_ASSISTANT} from "./openai_settings.js"

export let is_setting_ready = writable(false)
export const ai_settings = writable([])

export async function initializeAIAsk() {
    const storedSettings = await loadFromStorage("ai_settings") ?? []
    ai_settings.set(storedSettings)
    is_setting_ready.set(true)
}

async function onSuccessLoadFromStorage (settings, selectedText, usePromptSetting) {
    model.value = settings.model
    system_instructions.value = settings.system_instructions
    assistant_id.value = settings.assistant_id
    ai_settings.set(settings)
    is_setting_ready.set(true)
    return
}


export function ask_openai(selectedText, ai_setting) {
    //console.dir(selectedText)
    //console.dir(ai_setting)
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ai_setting.api_key}`,
    }
    //console.dir(headers)
    const prompt = OpenAIPrompt.value

    //console.log(`prompt: ${prompt}`)
    //console.log(`mode: ${ai_setting.mode}`)
    ask_spinner.style.visibility = 'visible'

    if (ai_setting.mode == MODE_CHAT) {
        //console.log(`Asked to ChatGPT: ${ai_setting.model}`)
        fetch_open_ai_chat(ai_setting, headers, prompt)
    } else if (ai_setting.mode = MODE_ASSISTANT){
        //console.log(`Asked to assistant_id: ${ai_setting.assistant_id}`)
        fetch_open_ai_assistant(ai_setting, headers, prompt)
    }
    return
}

async function fetch_open_ai_assistant (settings, headers, prompt) {
    headers['OpenAI-Beta'] = 'assistants=v1'

    // 1. create_thread
    const thread_id = await create_threads(settings, headers, prompt)
    //console.log(`thread_id: ${thread_id}`)
    if (thread_id == null) {
        ask_spinner.style.visibility = 'hidden'
        return
    }

    // 2. Create Message
    const message_id = await create_message (headers, thread_id, prompt)
    //console.log(`message_id: ${message_id}`)
    if (message_id == null) {
        ask_spinner.style.visibility = 'hidden'
        return
    }

    // 3. Run the Thread
    const run_id = await run_thread(headers, thread_id, settings)
    //console.log(`run_id: ${run_id}`)
    if (run_id == null) {
        ask_spinner.style.visibility = 'hidden'
        return
    }

    // 4. wait
    const status = await wait_run(headers, thread_id, run_id)
    //console.log(`status: ${status}`)
    if (status == null) {
        ask_spinner.style.visibility = 'hidden'
        return
    }

    // 5. Get Messages
    const raw = await get_messages(headers, thread_id)
    //console.log(`raw: ${raw}`)
    show_result(raw)
    ask_spinner.style.visibility = 'hidden'
    return
}

async function create_threads (settings, headers, prompt) {
    const url = 'https://api.openai.com/v1/threads'
    var id = null

    //console.log(url)

    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
        })
        .then(response => check_http_response(response))
        .then(j => {
            if(j != null){
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j['id']
            }
        })
        .catch (e => on_fetch_error(e))
    return id
}

async function  create_message (headers, thread_id, prompt) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/messages`
    var id = null
    const payload = {
        'role': 'user',
        'content': prompt
    }

    //console.log(url)
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))
    //console.log('headers: ' + JSON.stringify(headers, null, '\t'))

    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        })
        .then(response => check_http_response(response))
        .then(j => {
            if(j != null){
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j['id']
            }
        })
        .catch (e => on_fetch_error(e))
    return id
}

async function run_thread (headers, thread_id, settings) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/runs`
    var id = null
    const payload = {
        'assistant_id': settings.assistant_id
    }

    //console.log(`url: ${url}`)
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))

    const resp = await fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        })
        .then(response => check_http_response(response))
        .then(j => {
            if(j != null){
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j['id']
            }
        })
        .catch (e => on_fetch_error(e))
    return id
}

async function wait_run (headers, thread_id, run_id) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`
    var status = null
    var is_complete = false

    //console.log(`url: ${url}`)

    while(!is_complete){
        const resp = await fetch(
            url,
            {
                method: 'GET',
                headers: headers,
        })
        .then(response => check_http_response(response))
        .catch (e => on_fetch_error(e))

        const j = await resp
        if (j == null){
            is_complete = true
        } else{
            //console.log(j)
            status = j['status']
            if (status == 'completed') {
                //console.log('done')
                is_complete = true
            } else{
                //console.log('wait. 3secs')
                await new Promise(resolve => setTimeout(resolve, 3000))
            }
        }
    }
    return status
}

async function get_messages(headers, thread_id) {
    const url = `https://api.openai.com/v1/threads/${thread_id}/messages`
    var value = null

    //console.log(`url: ${url}`)

    const resp = await fetch(
        url,
        {
            method: 'GET',
            headers: headers,
        })
        .then(response => check_http_response(response))
        .then(j => {
            if(j != null){
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
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
            }
        })
        .catch (e => on_fetch_error(e))
    return value
}

function fetch_open_ai_chat (settings, headers, prompt) {
    const url = 'https://api.openai.com/v1/chat/completions'
    const requestBody = {
        model: settings.model,
        messages: [
            {
                role: 'system',
                content: system_instructions.value,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    }

    fetch(
        url,
        {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        })
    .then(response => check_http_response(response))
    .then(data => {
        if (data != null) {
            const raw = data.choices[0].message.content
            show_result(raw)
            ask_spinner.style.visibility = 'hidden'
        }
    })
    .catch(e => on_fetch_error(e))
    return
}

function on_fetch_error(e) {
    console.error(e)
    show_result(e.toString())
    return
}

function check_http_response(response) {
    //console.log(response)
    if (response.status != 200){
        show_result(`Http Response status: ${response.status}`)
        return null
    }
    return response.json()
}

function show_result(raw) {
    const html_content = marked.parse(raw)
    //console.info(`ChatGPT raw: ${raw}`)
    //console.info(`html : ${html_content}`)
    response.innerHTML = html_content
    return
}