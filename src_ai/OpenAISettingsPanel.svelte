<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { settings } from "./openai_settings.js"
    import BackButton from "./BackButton.svelte";

    const dispatch = createEventDispatcher();
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-gear-fill" /> OpenAI Settings</h3>

<div class="gray-box">
    You can use a meta variable <code>{"{text}"}</code> in the prompt setting.
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
                    bind:value={$settings.api_key}
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
                    bind:value={$settings.url}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Chat Model
                <br/>
                (<code>gpt-3.5-turbo</code>, <code>gpt-4</code> and <code>gpt-4-turbo-preview</code>)
            </td>
            <td>
                <select id="select_openai_model" class="form-select" aria-label="Default select example" bind:value={$settings.model}>
                    <option selected>Choose the OpenAI Model</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
                </select>
            </td>
        </tr>
        <tr out:fade>
            <td>
                System Instruction
            </td>
            <td>
                <textarea
                    type="text"
                    class="form-control setting-textarea"
                    rows="3"
                    bind:value={$settings.system_instruction}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Prompt
            </td>
            <td>
                <textarea
                    type="text"
                    class="form-control setting-textarea"
                    rows="10"
                    bind:value={$settings.prompt}
                />
            </td>
        </tr>
    </tbody>
</table>

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
    .setting-textarea {
        resize: none;
    }
</style>
