<script>
    import SearchForm from "./SearchForm.svelte";
    import SearchResults from "./SearchResults.svelte";

    let results;
</script>

<div>
    <SearchForm bind:results on:showBookmarks on:showSettings on:showOpenAISettings />
    <SearchResults {results} />
</div>
