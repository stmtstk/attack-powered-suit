<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { settings, MODE_ASSISTANTS, MODE_CHAT, onChangeMode } from "./openai_settings.js"
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
                Setting Name
            </td>
            <td>
                <input
                    type="text"
                    class="form-control"
                    bind:value={$settings.name}
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Mode
                <br/>
                (If you use the assistants, choose <code>Assistants</code>, otherwise leave <code>Chat</code>)
            </td>
            <td>
                <select id="select_openai_mode" class="form-select"  bind:value={$settings.mode} on:change={onChangeMode}>
                    <option value="{MODE_CHAT}">{MODE_CHAT}</option>
                    <option value="{MODE_ASSISTANTS}">{MODE_ASSISTANTS}</option>
                </select>
            </td>
        </tr>
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
                Chat Model
                <br/>
                (<code>gpt-3.5-turbo</code>, <code>gpt-4</code> and <code>gpt-4-turbo-preview</code>)
            </td>
            <td>
                <select id="select_openai_model" class="form-select" bind:value={$settings.model}>
                    <option selected>Choose the OpenAI Model</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
                </select>
            </td>
        </tr>
        <tr out:fade>
            <td>
                System Instructions
            </td>
            <td>
                <textarea
                    id="setting_system_instructions"
                    type="text"
                    class="form-control setting-textarea"
                    rows="3"
                    bind:value={$settings.system_instructions}
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
        <tr out:fade>
            <td>
                Assistant ID
            </td>
            <td>
                <input
                    id="setting_assistant_id"
                    type="text"
                    class="form-control"
                    bind:value={$settings.assistant_id}
                />
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
