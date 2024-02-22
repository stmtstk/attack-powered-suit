import { marked } from "marked";
import { writable } from "svelte/store";
import { loadFromStorage } from "./storage.js";
import { modeChat, modeAssistant } from "./openai_settings.js";

export let isSettingReady = writable(false);
export const aiSettings = writable([]);
export let selectedConfigurationName = writable("-1");

export async function initializeAIAsk() {
    const storedSettings = (await loadFromStorage("ai_settings")) ?? [];
    aiSettings.set(storedSettings);
    isSettingReady.set(true);
    return;
}

export function askOpenAI(selectedText, aiSetting) {
    //console.dir(selectedText)
    //console.dir(ai_setting)
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiSetting.api_key}`,
    };
    //console.dir(headers)
    const prompt = OpenAIPrompt.value;

    //console.log(`prompt: ${prompt}`)
    //console.log(`mode: ${ai_setting.mode}`)
    ask_spinner.style.visibility = "visible";

    if (aiSetting.mode == modeChat) {
        //console.log(`Asked to ChatGPT: ${ai_setting.model}`)
        fetchOpenAIChat(aiSetting, headers, prompt);
    } else if ((aiSetting.mode = modeAssistant)) {
        //console.log(`Asked to assistant_id: ${ai_setting.assistant_id}`)
        fetchOpenAIAssistant(aiSetting, headers, prompt);
    }
    return;
}

async function fetchOpenAIAssistant(settings, headers, prompt) {
    headers["OpenAI-Beta"] = "assistants=v1";

    // 1. create_thread
    const threadID = await createThreads(settings, headers, prompt);
    //console.log(`thread_id: ${thread_id}`)
    if (threadID == null) {
        ask_spinner.style.visibility = "hidden";
        return;
    }

    // 2. Create Message
    const messageID = await createMessage(headers, threadID, prompt);
    //console.log(`message_id: ${message_id}`)
    if (messageID == null) {
        ask_spinner.style.visibility = "hidden";
        return;
    }

    // 3. Run the Thread
    const runID = await runThread(headers, threadID, settings);
    //console.log(`run_id: ${run_id}`)
    if (runID == null) {
        ask_spinner.style.visibility = "hidden";
        return;
    }

    // 4. wait
    const status = await waitRun(headers, threadID, runID);
    //console.log(`status: ${status}`)
    if (status == null) {
        ask_spinner.style.visibility = "hidden";
        return;
    }

    // 5. Get Messages
    const raw = await getMessages(headers, threadID);
    //console.log(`raw: ${raw}`)
    showResult(raw);
    ask_spinner.style.visibility = "hidden";
    return;
}

async function createThreads(settings, headers, prompt) {
    const url = "https://api.openai.com/v1/threads";
    var id = null;

    //console.log(url)

    const resp = await fetch(url, {
        method: "POST",
        headers: headers,
    })
        .then((response) => checkHttpResponse(response))
        .then((j) => {
            if (j != null) {
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j["id"];
            }
        })
        .catch((e) => onFetchError(e));
    return id;
}

async function createMessage(headers, threadID, prompt) {
    const url = `https://api.openai.com/v1/threads/${threadID}/messages`;
    var id = null;
    const payload = {
        role: "user",
        content: prompt,
    };

    //console.log(url)
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))
    //console.log('headers: ' + JSON.stringify(headers, null, '\t'))

    const resp = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then((response) => checkHttpResponse(response))
        .then((j) => {
            if (j != null) {
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j["id"];
            }
        })
        .catch((e) => onFetchError(e));
    return id;
}

async function runThread(headers, threadID, settings) {
    const url = `https://api.openai.com/v1/threads/${threadID}/runs`;
    var id = null;
    const payload = {
        assistant_id: settings.assistant_id,
    };

    //console.log(`url: ${url}`)
    //console.log('payload: ' + JSON.stringify(payload, null, '\t'))

    const resp = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then((response) => checkHttpResponse(response))
        .then((j) => {
            if (j != null) {
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                id = j["id"];
            }
        })
        .catch((e) => onFetchError(e));
    return id;
}

async function waitRun(headers, threadID, runID) {
    const url = `https://api.openai.com/v1/threads/${threadID}/runs/${runID}`;
    var status = null;
    var isComplete = false;

    //console.log(`url: ${url}`)

    while (!isComplete) {
        const resp = await fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => checkHttpResponse(response))
            .catch((e) => onFetchError(e));

        const j = await resp;
        if (j == null) {
            isComplete = true;
        } else {
            //console.log(j)
            status = j["status"];
            if (status == "completed") {
                //console.log('done')
                isComplete = true;
            } else {
                //console.log('wait. 3secs')
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    }
    return status;
}

async function getMessages(headers, threadID) {
    const url = `https://api.openai.com/v1/threads/${threadID}/messages`;
    var value = null;

    //console.log(`url: ${url}`)

    const resp = await fetch(url, {
        method: "GET",
        headers: headers,
    })
        .then((response) => checkHttpResponse(response))
        .then((j) => {
            if (j != null) {
                //console.log('j: ' + JSON.stringify(j, null, '\t'))
                j["data"].forEach(function (data) {
                    if (data["role"] != "assistant") {
                        return false;
                    }
                    data["content"].forEach(function (content) {
                        if (content["type"] != "text") {
                            return false;
                        }
                        value = content["text"]["value"];
                        return true;
                    });
                    if (value != null) {
                        return true;
                    }
                });
            }
        })
        .catch((e) => onFetchError(e));
    return value;
}

function fetchOpenAIChat(settings, headers, prompt) {
    const url = "https://api.openai.com/v1/chat/completions";
    const requestBody = {
        model: settings.model,
        messages: [
            {
                role: "system",
                content: system_instructions.value,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
    })
        .then((response) => checkHttpResponse(response))
        .then((data) => {
            if (data != null) {
                const raw = data.choices[0].message.content;
                showResult(raw);
                ask_spinner.style.visibility = "hidden";
            }
        })
        .catch((e) => onFetchError(e));
    return;
}

function onFetchError(e) {
    console.error(e);
    showResult(e.toString());
    return;
}

function checkHttpResponse(response) {
    //console.log(response)
    if (response.status != 200) {
        showResult(`Http Response status: ${response.status}`);
        return null;
    }
    return response.json();
}

function showResult(raw) {
    const htmlContent = marked.parse(raw);
    //console.info(`ChatGPT raw: ${raw}`)
    //console.info(`html : ${html_content}`)
    response.innerHTML = htmlContent;
    return;
}
