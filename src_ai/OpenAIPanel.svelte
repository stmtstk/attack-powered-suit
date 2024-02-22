<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { writable } from "svelte/store";
    import BackButton from "./BackButton.svelte";
    import { modeChat, modeAssistant } from "./openai_settings.js";

    import { askOpenAI, aiSettings, initializeAIAsk } from "./openai.js";

    const dispatch = createEventDispatcher();
    let selectedText = "";
    const defaultConfigurationName = "";
    let selectedConfigurationName = writable(defaultConfigurationName);

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        selectedText = params.get("selected_text") || "";
        initializeAIAsk();
    });

    function getAISetting(settingName) {
        for (let aiSetting of $aiSettings) {
            if (aiSetting.name == settingName) {
                return aiSetting;
            }
        }
        return null;
    }

    function onChangeSelectSetting(e) {
        if ($selectedConfigurationName == defaultConfigurationName) {
            alert("Choose Configuration Name");
            return;
        }
        const aiSetting = getAISetting($selectedConfigurationName);
        if (aiSetting == null) {
            alert("Invalid Configuration Name");
            return;
        }
        overwriteSettingForm(aiSetting);
    }

    function overwriteSettingForm(aiSetting) {
        OpenAIPrompt.value = aiSetting.prompt.replaceAll(
            "{text}",
            selectedText
        );
        if (aiSetting.mode == modeAssistant) {
            model.value = "This setting is not used by Assistant";
            assistant_id.value = aiSetting.assistant_id;
            system_instructions.value = "This setting is not used by Assistant";
            system_instructions.disabled = true;
        } else if (aiSetting.mode == modeChat) {
            model.value = aiSetting.model;
            assistant_id.value = "This setting is not used by ChatGPT";
            system_instructions.value = aiSetting.system_instructions;
        }
        return;
    }

    function onAskButtonClick() {
        const aiSetting = getAISetting($selectedConfigurationName);
        if (aiSetting == null) {
            alert("Invalid Configuration Name");
            return;
        }
        askOpenAI(selectedText, aiSetting);
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-chat-left-dots" /> OpenAI Conversation</h3>

<div class="selected-text-row">
    <select
        id="select_ask_configuration_name"
        class="form-select"
        bind:value={$selectedConfigurationName}
        on:change={onChangeSelectSetting}
    >
        <option value={defaultConfigurationName}
            >Choose OpenAI Configuration</option
        >
        {#each $aiSettings as aiSetting}
            <option value={aiSetting.name}>{aiSetting.name}</option>
        {/each}
    </select>
</div>

<br />

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

<br />

<form>
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id="model"
                type="text"
                class="form-control"
                readonly="True"
            />
            <label for="model">OpenAI Model</label>
        </div>
    </div>
    <br />
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id="assistant_id"
                type="text"
                class="form-control"
                readonly="True"
            />
            <label for="assistant_id">Assistant ID</label>
        </div>
    </div>
    <br />
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
    <br />
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
    <br />
    <hr />
    <label for="response">OpenAI Response</label>
    <br /><br />
    <div class="selected-text-row">
        <div class="form-floating">
            <div id="response" />
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
