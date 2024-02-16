<script>
    import { afterUpdate, createEventDispatcher, onMount } from "svelte";
    import BackButton from "./BackButton.svelte";

    import { ask_openai } from "./openai.js"

    const dispatch = createEventDispatcher();
    let selectedText = ''

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        selectedText = params.get("selected_text") || "";
    });

    afterUpdate(() => {
        ask_openai(selectedText, true)
    })

    function onAskButtonClick() {
        ask_openai("", false)
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-chat-left-dots" /> OpenAI Conversation</h3>

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
            <label for="assistant_id">Assistants ID</label>
        </div>
    </div>
    <br/>
    <div class="selected-text-row">
        <div class="form-floating">
            <textarea
                id="system_instruction"
                type="text"
                class="form-control conversation-textarea st-textarea"
                rows="3"
            />
            <label for="system_instruction">System Instruction</label>
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
