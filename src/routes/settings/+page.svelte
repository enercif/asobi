<script lang="ts">
    import { setLocale } from "$lib/paraglide/runtime";
</script>

<div class="flex flex-col size-full gap-8">
    <div class="flex flex-row items-start justify-between gap-5">
        <p class="text-5xl font-bold">Settings</p>
    </div>

    <button onclick={() => setLocale("de")}>German</button>
    <button onclick={() => setLocale("en")}>English</button>
</div>
