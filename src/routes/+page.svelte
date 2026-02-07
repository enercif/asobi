<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import { setLocale } from "$lib/paraglide/runtime";
</script>

<h1>{m.hello_world({ name: "Asobi" })}</h1>
<h1>{m.aqua_heavy_seahorse_persist()}</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<button onclick={() => setLocale("de")}>German</button>
<button onclick={() => setLocale("en")}>English</button>
