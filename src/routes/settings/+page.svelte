<script lang="ts">
    import { setLocale } from "$lib/paraglide/runtime";
</script>

<div class="flex size-full flex-col gap-8">
    <div class="flex flex-row items-start justify-between gap-5">
        <p class="text-5xl font-bold">Settings</p>
    </div>

    <button onclick={() => setLocale("de")}>German</button>
    <button onclick={() => setLocale("en")}>English</button>
</div>
