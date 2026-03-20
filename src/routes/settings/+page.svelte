<script lang="ts">
    import { setLocale } from "$lib/paraglide/runtime";
</script>

<div class="flex size-full flex-col gap-8">
    <button onclick={() => setLocale("de")}>German</button>
    <button onclick={() => setLocale("en")}>English</button>
</div>
