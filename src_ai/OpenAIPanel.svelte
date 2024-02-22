<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { writable } from "svelte/store"
    import BackButton from "./BackButton.svelte";
    import { MODE_CHAT, MODE_ASSISTANT} from "./openai_settings.js"

    import {
        ask_openai,
        ai_settings,
        initializeAIAsk,
    } from "./openai.js"

    const dispatch = createEventDispatcher();
    let selectedText = ''
    const DEFAULT_CONFIGURATION_NAME = ''
    let selected_configuration_name = writable(DEFAULT_CONFIGURATION_NAME)

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        selectedText = params.get("selected_text") || "";
        initializeAIAsk()
    });

    function getAISetting(setting_name) {
        for(let ai_setting of $ai_settings) {
            if(ai_setting.name == setting_name){
                return ai_setting
            }
        }
        return null
    }

    function onChangeSelectSetting(e) {
        if ($selected_configuration_name == DEFAULT_CONFIGURATION_NAME) {
            alert('Choose Configuration Name')
            return
        }
        const ai_setting = getAISetting($selected_configuration_name)
        if (ai_setting == null) {
            alert('Invalid Configuration Name')
            return
        }
        overwrite_setting_form(ai_setting)
    }

    function overwrite_setting_form(ai_setting) {
        OpenAIPrompt.value = ai_setting.prompt.replaceAll('{text}', selectedText)
        if(ai_setting.mode == MODE_ASSISTANT) {
            model.value = 'This setting is not used by Assistant'
            assistant_id.value = ai_setting.assistant_id
            system_instructions.value = 'This setting is not used by Assistant'
            system_instructions.disabled = true
        } else if (ai_setting.mode == MODE_CHAT){
            model.value = ai_setting.model
            assistant_id.value = 'This setting is not used by ChatGPT'
            system_instructions.value = ai_setting.system_instructions
        }
        return
    }

    function onAskButtonClick() {
        const ai_setting = getAISetting($selected_configuration_name)
        if (ai_setting == null) {
            alert('Invalid Configuration Name')
            return
        }
        ask_openai(selectedText, ai_setting)
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-chat-left-dots" /> OpenAI Conversation</h3>

<div class="selected-text-row">
    <select
        id="select_ask_configuration_name"
        class="form-select"
        bind:value={$selected_configuration_name}
        on:change={onChangeSelectSetting}
    >
        <option value={DEFAULT_CONFIGURATION_NAME}>Choose OpenAI Configuration</option>
    {#each $ai_settings as ai_setting}
        <option value="{ai_setting.name}">{ai_setting.name}</option>
    {/each}
    </select>
</div>

<br/>

<div class="selected-text-row">
    <div class="form-floating">
        <button class="btn btn-primary btn-sm" on:click={onAskButtonClick}>
            <i class="bookmark-icon bi bi-plus-circle-fill" />
                Ask OpenAI
        </button>
    </div>
    <div id="ask_spinner" class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</div>

<br/>

<form>
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id="model"
                type="text"
                class="form-control"
                readonly=True
            />
            <label for="model">OpenAI Model</label>
        </div>
    </div>
    <br/>
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id="assistant_id"
                type="text"
                class="form-control"
                readonly=True
            />
            <label for="assistant_id">Assistant ID</label>
        </div>
    </div>
    <br/>
    <div class="selected-text-row">
        <div class="form-floating">
            <textarea
                id="system_instructions"
                type="text"
                class="form-control conversation-textarea st-textarea"
                rows="3"
            />
            <label for="system_instructions">System Instructions</label>
        </div>
    </div>
    <br/>
    <div class="selected-text-row">
        <div class="form-floating">
            <textarea
                id="OpenAIPrompt"
                type="text"
                class="form-control conversation-textarea st-textarea"
                rows="3"
            />
            <label for="selectedText">Prompt Content</label>
        </div>
    </div>
    <br/>
    <hr/>
    <label for="response">OpenAI Response</label>
    <br/><br/>
    <div class="selected-text-row">
        <div class="form-floating">
            <div id="response"/>
        </div>
    </div>
</form>

<p class="credits">
    ATT&CK Powered Suit is published by the <a
        href="https://ctid.mitre-engenuity.org"
        >Center for Threat-Informed Defense</a
    >. Special thanks to Toshitaka Satomi from Fujitsu for sharing the idea and
    code.
    <i
        class="bi
        bi-stars"
    />
</p>
<p />

<style>
    .credits {
        margin: 0 auto;
        color: var(--bs-gray-600);
        font-size: 0.8em;
        border-top: 1px solid var(--bs-gray-400);
        margin-top: 1rem;
        padding-top: 0.5rem;
    }
    .st-textarea {
        height: 100px;
    }
    .conversation-textarea {
        resize: none;
    }
    #ask_spinner {
        width: 1rem;
        height: 1rem;
        visibility: hidden;
    }
</style>
