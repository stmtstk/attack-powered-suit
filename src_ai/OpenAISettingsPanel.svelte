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
    TBD (Description) <code>{"{description}"}</code>
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
            </td>
            <td>
                <input
                    type="text"
                    class="form-control"
                    bind:value={$settings.model}
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
                    bind:value={$settings.system_introduction}
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
</style>
