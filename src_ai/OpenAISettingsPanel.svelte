<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { writable } from "svelte/store";
    import { fade } from "svelte/transition";
    import {
        settings,
        isSettingReady,
        modeAssistant,
        modeChat,
        initializeAISettings,
    } from "./openai_settings.js";
    import BackButton from "./BackButton.svelte";

    const dispatch = createEventDispatcher();
    let selectedConfigurationName = writable("");
    const openAIModels = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"];
    const defaultAIModel = "gpt-3.5-turbo";

    onMount(() => {
        initializeAISettings().then(() => {});
    });

    function overwrite_form_value(setting) {
        text_configuration_name.value = setting.name;
        select_configuration_name.value = setting.name;
        select_openai_mode.value = setting.mode;
        open_ai_key.value = setting.api_key;
        setting_prompt.value = setting.prompt;

        if (select_openai_mode.value == modeAssistant) {
            select_openai_model.value = "";
            setting_system_instructions.value = "";
            setting_assistant_id.value = setting.assistant_id;
        } else if (select_openai_mode.value == modeChat) {
            select_openai_model.value = setting.model;
            setting_system_instructions.value = setting.system_instructions;
            setting_assistant_id.value = "";
        }
        onChangeMode();
        return;
    }

    function onChangeMode() {
        if (select_openai_mode.value == modeAssistant) {
            onChangeAssistant();
        } else if (select_openai_mode.value == modeChat) {
            onChangeChat();
        }
        return;
    }

    function onChangeConfigurationName() {
        const ret = confirm("Discard your setting?");
        if (ret == false) {
            return;
        }

        for (let setting of $settings) {
            if (setting.name == selectedConfigurationName) {
                overwrite_form_value(setting);
                return;
            }
        }
        return;
    }

    function onChangeChat() {
        setting_assistant_id.disabled = true;
        select_openai_model.disabled = false;
        setting_system_instructions.disabled = false;
    }

    function onChangeAssistant() {
        setting_assistant_id.disabled = false;
        select_openai_model.disabled = true;
        setting_system_instructions.disabled = true;
    }

    function onDeleteButtonClick() {
        const name = text_configuration_name.value;
        if (name.length == 0) {
            alert("Please specify configuration name");
            return;
        }
        const ret = confirm(`Delete your configuration? (${name})`);
        if (ret == false) {
            return;
        }

        let newSettings = [];
        for (let setting of $settings) {
            if (setting.name != name) {
                newSettings.push(setting);
            }
        }
        $settings = newSettings;
        alert("Deleted");
        clearForm();
        return;
    }

    function clearForm() {
        text_configuration_name.value = "No Name";
        select_openai_mode.value = modeChat;
        open_ai_key.value = "";
        select_openai_model.value = defaultAIModel;
        setting_system_instructions.value =
            "Please fill your cool system instructions";
        setting_prompt.value = "Please fill your cool prompt";
        setting_assistant_id.value = `If you specify ${modeAssistant}, please fill your Assistant id`;
        setting_assistant_id.disabled = true;
        onChangeMode();
        return;
    }

    function onNewButtonClick() {
        const ret = confirm("Discard your configuration?");
        if (ret == false) {
            return;
        }
        clearForm();
        return;
    }

    function onSaveButtonClick() {
        const name = text_configuration_name.value;
        if (name.length == 0) {
            alert("Please specify configuration name");
            return;
        }

        let newSettings = [];
        if ($settings.length == 0) {
            newSettings.push(getNewSetting(name));
        } else {
            let isAppend = false;
            for (let setting of $settings) {
                if (setting.name == name) {
                    let newSetting = getNewSetting(name);
                    newSettings.push(newSetting);
                    isAppend = true;
                } else {
                    newSettings.push(setting);
                }
            }
            if (isAppend == false) {
                newSettings.push(getNewSetting(name));
            }
        }
        $settings = newSettings;
        alert("Saved");
    }

    function getNewSetting(name) {
        let newSetting = {};
        newSetting.name = name;
        newSetting.mode = select_openai_mode.value;
        newSetting.api_key = open_ai_key.value;
        newSetting.model = select_openai_model.value;
        newSetting.system_instructions = setting_system_instructions.value;
        newSetting.prompt = setting_prompt.value;
        newSetting.assistant_id = setting_assistant_id.value;
        return newSetting;
    }
</script>

<BackButton on:back={() => dispatch("showSearch")} />
<h2>ATT&CK Powered Suit (New Edition)</h2>
<h3><i class="bi bi-gear-fill" /> OpenAI Settings</h3>

<div class="gray-box">
    You can use a meta variable <code>{"{text}"}</code> in the prompt setting.
</div>
<hr />
<div class="gray-box">
    Choose OpenAI Configuration
    <br />
    {#if $isSettingReady === true}
        <select
            id="select_configuration_name"
            class="form-select"
            bind:value={selectedConfigurationName}
            on:change={onChangeConfigurationName}
        >
            {#each $settings as setting}
                <option value={setting.name}>{setting.name}</option>
            {/each}
        </select>
    {/if}
</div>
<hr />

<button
    class="btn btn-block btn-info"
    type="button"
    value="left"
    on:click={() => onNewButtonClick()}
>
    <i class="bi bi-file-earmark-plus-fill" />
    New
</button>
<button
    class="btn btn-block btn-info"
    type="button"
    value="right"
    on:click={() => onSaveButtonClick()}
>
    <i class="bi bi-save-fill" />
    Save
</button>
<button
    class="btn btn-block btn-danger"
    type="button"
    value="right"
    on:click={() => onDeleteButtonClick()}
>
    <i class="bi bi-trash3-fill" />
    Delete
</button>
<hr />

<table class="table">
    <thead>
        <tr>
            <th>Item</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr out:fade>
            <td> Configuration Name </td>
            <td>
                <input
                    type="text"
                    id="text_configuration_name"
                    class="form-control"
                />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Mode
                <br />
                (If you use the assistants, choose <code>Assistants</code>,
                otherwise leave <code>Chat</code>)
            </td>
            <td>
                <select
                    id="select_openai_mode"
                    class="form-select"
                    value={modeChat}
                    on:change={onChangeMode}
                >
                    <option value={modeChat}>{modeChat}</option>
                    <option value={modeAssistant}>{modeAssistant}</option>
                </select>
            </td>
        </tr>
        <tr out:fade>
            <td> OpenAI Key </td>
            <td>
                <input id="open_ai_key" type="password" class="form-control" />
            </td>
        </tr>
        <tr out:fade>
            <td>
                Chat Model
                <br />
            </td>
            <td>
                <select id="select_openai_model" class="form-select">
                    <option selected>Choose the OpenAI Model</option>
                    {#each openAIModels as openAIModel}
                        <option value={openAIModel}>{openAIModel}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr out:fade>
            <td> System Instructions </td>
            <td>
                <textarea
                    id="setting_system_instructions"
                    type="text"
                    class="form-control setting-textarea"
                    rows="3"
                />
            </td>
        </tr>
        <tr out:fade>
            <td> Prompt </td>
            <td>
                <textarea
                    id="setting_prompt"
                    type="text"
                    class="form-control setting-textarea"
                    rows="10"
                />
            </td>
        </tr>
        <tr out:fade>
            <td> Assistant ID </td>
            <td>
                <input
                    id="setting_assistant_id"
                    type="text"
                    class="form-control"
                />
            </td></tr
        >
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
