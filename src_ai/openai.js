import { writable } from "svelte/store";
import { loadFromStorage } from "./storage.js";
import { modeChat, modeAssistant } from "./openai_settings.js";

export let isSettingReady = false;
export const aiSettings = writable([]);
export let selectedConfigurationName = "-1";

export async function initializeAIAsk() {
    const storedSettings = (await loadFromStorage("ai_settings")) ?? [];
    aiSettings.set(storedSettings);
    isSettingReady = true;
    return;
}

export async function askOpenAI(aiSetting, prompt, systemInstructions) {
    //console.dir(ai_setting)
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiSetting.api_key}`,
    };
    //console.dir(headers)

    //console.log(`prompt: ${prompt}`)
    //console.log(`mode: ${ai_setting.mode}`)

    let content = "";
    if (aiSetting.mode == modeChat) {
        //console.log(`Asked to ChatGPT: ${ai_setting.model}`)
        await fetchOpenAIChat(aiSetting, headers, prompt, systemInstructions)
            .then((ret) => {
                //console.log(ret);
                content = ret;
            })
            .catch((e) => {
                throw e;
            });
    } else if ((aiSetting.mode = modeAssistant)) {
        //console.log(`Asked to assistant_id: ${ai_setting.assistant_id}`)
        await fetchOpenAIAssistant(aiSetting, headers, prompt)
            .then((ret) => {
                //console.log(ret);
                content = ret;
            })
            .catch((e) => {
                throw e;
            });
    }
    return content;
}

async function fetchOpenAIAssistant(settings, headers, prompt) {
    headers["OpenAI-Beta"] = "assistants=v1";

    // 1. create_thread
    const threadID = await createThreads(settings, headers, prompt);
    //console.log(`thread_id: ${thread_id}`)
    if (threadID == null) {
        return "";
    }

    // 2. Create Message
    const messageID = await createMessage(headers, threadID, prompt);
    //console.log(`message_id: ${message_id}`)
    if (messageID == null) {
        return "";
    }

    // 3. Run the Thread
    const runID = await runThread(headers, threadID, settings);
    //console.log(`run_id: ${run_id}`)
    if (runID == null) {
        return "";
    }

    // 4. wait
    const status = await waitRun(headers, threadID, runID);
    //console.log(`status: ${status}`)
    if (status == null) {
        return "";
    }

    // 5. Get Messages
    const raw = await getMessages(headers, threadID);
    //console.log(`raw: ${raw}`)
    return raw;
}

async function createThreads(settings, headers, prompt) {
    const url = "https://api.openai.com/v1/threads";
    var id = null;

    //console.log(url)

    await fetch(url, {
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

async function fetchOpenAIChat(settings, headers, prompt, systemInstructions) {
    const url = "https://api.openai.com/v1/chat/completions";
    const requestBody = {
        model: settings.model,
        messages: [
            {
                role: "system",
                content: systemInstructions,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    let ret = "";
    await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
    })
        .then((response) => checkHttpResponse(response))
        .then((data) => {
            if (data != null) {
                ret = data.choices[0].message.content;
            }
        })
        .catch((e) => {
            throw e;
        });
    //console.dir(ret);
    return ret;
}

function onFetchError(e) {
    //console.error(e);
    return e.toString();
}

function checkHttpResponse(response) {
    if (response.status != 200) {
        throw new Error(`Http Response status: ${response.status}`);
    }
    return response.json();
}
