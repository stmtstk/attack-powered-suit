import { writable } from "svelte/store";

export let api_key = writable('test_api_key');
export let api_url = writable('https://api.openai.com/v1/chat/completions');
export let api_chat_model = writable('gpt-3.5-turbo');
export let system_introduction = writable('You are a helpful assistant');

export function save () {
	alert('save')
};