<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import {
        //removeFormat,
        //formatsStore,
        saveFormats,
        addFormat,
    } from "./formats.js";
    import {
        api_key,
        api_url,
        api_chat_model,
        system_introduction,
        save,
    } from "./openai.js"
    import BackButton from "./BackButton.svelte";
    //import { supportsClipboardItem } from "./Clipboard.js";

    const dispatch = createEventDispatcher();

    function newFormat() {
        addFormat("new format", "", "text/plain");
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (Help!! My Buddy!)</h2>
<h3><i class="bi bi-gear-fill" /> Open AI Settings</h3>

<div class="gray-box">
    メタ変数として 云々 <code>{"{description}"}</code>
</div>

<table class="table">
    <thead>
        <tr>
            <th>Item</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr out:fade>
            <td>
                OpenAI Key
            </td>
            <td>
                <input
                    type="password"
                    class="form-control"
                    readonly="readonly"
                    bind:value={$api_key}
                    on:input={saveFormats}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                URL
            </td>
            <td>
                <input
                    type="text"
                    class="form-control"
                    readonly="readonly"
                    bind:value={$api_url}
                    on:input={saveFormats}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Chat Model
            </td>
            <td>
                <input
                    type="text"
                    class="form-control"
                    readonly="readonly"
                    bind:value={$api_chat_model}
                    on:input={saveFormats}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                System Introduction
            </td>
            <td>
                <input
                    type="text"
                    class="form-control"
                    readonly="readonly"
                    bind:value={$system_introduction}
                    on:input={saveFormats}
                />
            </td>
        </tr>
    </tbody>
</table>

<p>
    <button class="btn btn-primary btn-sm" on:click={save}>
        <i class="bookmark-icon bi" /> Save
    </button>
</p>

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
    .remove-format {
        cursor: pointer;
        color: var(--me-ext-orange-dark);
    }

    .remove-format:hover {
        color: var(--me-ext-orange-highlighter);
    }

    .credits {
        margin: 0 auto;
        color: var(--bs-gray-600);
        font-size: 0.8em;
        border-top: 1px solid var(--bs-gray-400);
        margin-top: 1rem;
        padding-top: 0.5rem;
    }
</style>
