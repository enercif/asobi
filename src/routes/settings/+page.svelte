<script lang="ts">
    import { setLocale } from "$lib/paraglide/runtime";
</script>

<button onclick={() => setLocale("de")}>German</button>
<button onclick={() => setLocale("en")}>English</button>
