<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { marked } from "marked";
    import BackButton from "./BackButton.svelte";
    import { modeChat, modeAssistant } from "./openai_settings.js";

    import { askOpenAI, aiSettings, initializeAIAsk } from "./openai.js";

    const dispatch = createEventDispatcher();
    const defaultConfigurationName = "";

    let selectedText = "";
    let selectedConfigurationName = defaultConfigurationName;
    let assistantIDValue = "";
    let modelValue = "";
    let systemInstructionsValue = "";
    let systemInstructionsReadOnly = false;
    let openAIPromptValue = "";
    let isSpinnerVisible = false;
    let responseDiv;
    let askSpinnerDiv;

    const idModel = "model";
    const idAssistantID = "assistantID";
    const idSystemInstructions = "systemInstructions";
    const idOpenAIPrompt = "openAIPrompt";

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
        if (selectedConfigurationName == defaultConfigurationName) {
            alert("Choose Configuration Name");
            return;
        }
        const aiSetting = getAISetting(selectedConfigurationName);
        if (aiSetting == null) {
            alert("Invalid Configuration Name");
            return;
        }
        overwriteSettingForm(aiSetting);
    }

    function overwriteSettingForm(aiSetting) {
        openAIPromptValue = aiSetting.prompt.replaceAll("{text}", selectedText);
        if (aiSetting.mode == modeAssistant) {
            modelValue = "This setting is not used by Assistant";
            assistantIDValue = aiSetting.assistant_id;
            systemInstructionsValue = "This setting is not used by Assistant";
            systemInstructionsReadOnly = true;
        } else if (aiSetting.mode == modeChat) {
            modelValue = aiSetting.model;
            assistantIDValue = "This setting is not used by ChatGPT";

            systemInstructionsValue = aiSetting.system_instructions;
            systemInstructionsReadOnly = false;
        }
        return;
    }

    async function onAskButtonClick() {
        const aiSetting = getAISetting(selectedConfigurationName);
        if (aiSetting == null) {
            alert("Invalid Configuration Name");
            return;
        }

        isSpinnerVisible = true;
        responseDiv.innerHTML = "";

        let htmlContent = "";
        await askOpenAI(aiSetting, openAIPromptValue, systemInstructionsValue)
            .then((ret) => {
                htmlContent = marked.parse(ret);
            })
            .catch((e) => {
                console.error(e);
                htmlContent = e.toString();
            })
            .finally(() => {});
        responseDiv.innerHTML = htmlContent;
        isSpinnerVisible = false;
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-chat-left-dots" /> OpenAI Conversation</h3>

<div class="selected-text-row">
    <select
        class="form-select"
        bind:value={selectedConfigurationName}
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
    <div
        bind:this={askSpinnerDiv}
        class="spinner-border text-primary {isSpinnerVisible
            ? 'ask-spinner-visible'
            : 'ask-spinner-hidden'}"
        role="status"
    >
        <span class="visually-hidden">Loading...</span>
    </div>
</div>

<br />

<form>
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id={idModel}
                type="text"
                class="form-control"
                readonly="True"
                bind:value={modelValue}
            />
            <label for={idModel}>OpenAI Model</label>
        </div>
    </div>
    <br />
    <div class="selected-text-row">
        <div class="form-floating">
            <input
                id={idAssistantID}
                type="text"
                class="form-control"
                readonly="True"
                bind:value={assistantIDValue}
            />
            <label for={idAssistantID}>Assistant ID</label>
        </div>
    </div>
    <br />
    <div class="selected-text-row">
        <div class="form-floating">
            <textarea
                id={idSystemInstructions}
                type="text"
                class="form-control conversation-textarea st-textarea"
                rows="3"
                readonly={systemInstructionsReadOnly}
                bind:value={systemInstructionsValue}
            />
            <label for={idSystemInstructions}>System Instructions</label>
        </div>
    </div>
    <br />
    <div class="selected-text-row">
        <div class="form-floating">
            <textarea
                id={idOpenAIPrompt}
                type="text"
                class="form-control conversation-textarea st-textarea"
                rows="3"
                bind:value={openAIPromptValue}
            />
            <label for={idOpenAIPrompt}>Prompt Content</label>
        </div>
    </div>
    <br />
    <hr />
    <label for="response">OpenAI Response</label>
    <br /><br />
    <div class="selected-text-row">
        <div class="form-floating">
            <div bind:this={responseDiv} />
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
    .ask-spinner-visible {
        width: 1rem;
        height: 1rem;
        visibility: visible;
    }
    .ask-spinner-hidden {
        visibility: hidden;
    }
</style>
