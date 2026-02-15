<script lang="ts">
    import { impostorCategories } from "$lib/games/impostor/categories";
    import Dialog from "$lib/ui/dialog.svelte";
    import Slider from "$lib/ui/slider.svelte";
    import Switch from "$lib/ui/switch.svelte";
    import {
        BookmarkIcon,
        CheckIcon,
        ChevronLeft,
        CircleDashedIcon,
        CircleQuestionMarkIcon,
        HatGlassesIcon,
        SearchIcon,
        TimerIcon,
        UserIcon,
    } from "@lucide/svelte";

    const minPlayers = 3;

    let stared = $state(false);

    let player: string[] = $state([""]);
    let selectedPlayers = $derived(player.slice(0, -1));
    let playerCount = $derived(selectedPlayers.length);

    let selectedImpostorCount = $state(1);
    let randomImpostor = $state(false);
    let randomImpostorRange = $state([1, 2]);

    let selectedCategories = $state(["1"]);

    function updatePlayer(index: number, value: string) {
        player[index] = value;

        const lastIndex = player.length - 1;

        if (index === lastIndex && value.trim() !== "") {
            player.push("");
        }

        player = player.filter((p, i) => {
            if (i === player.length - 1) return true;
            return p.trim() !== "";
        });
    }

    function getImpostorCount(): string {
        if (playerCount < minPlayers) {
            return "0";
        }

        if (randomImpostor) {
            const min = randomImpostorRange[0];
            const max = randomImpostorRange[1];
            return min === max ? min.toString() : `${min} - ${max}`;
        } else {
            return selectedImpostorCount.toString();
        }
    }

    function onCategorySelect(categoryId: string) {
        if (selectedCategories.includes(categoryId)) {
            if (selectedCategories.length === 1) {
                return;
            }
            selectedCategories = selectedCategories.filter((id) => id !== categoryId);
        } else {
            selectedCategories.push(categoryId);
        }
    }
</script>

<div class="flex flex-col gap-20 h-full">
    <div class="relative flex flex-row items-center justify-between">
        <a class="bg-white rounded-lg size-12 flex items-center justify-center" href="/">
            <ChevronLeft size={28} />
        </a>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 class="text-3xl font-bold">Impostor</h1>
        </div>

        <div class="flex flex-row items-center bg-white rounded-lg">
            <button class="size-12 flex items-center justify-center">
                <CircleQuestionMarkIcon size={28} />
            </button>

            <div class="h-9 border-r border-contrast/50"></div>

            <button
                class="size-12 flex items-center justify-center"
                onclick={() => (stared = !stared)}
            >
                <BookmarkIcon
                    size={28}
                    class={stared
                        ? "fill-primary text-primary duration-150 transition-all"
                        : "fill-none text-black duration-150 transition-all"}
                />
            </button>
        </div>
    </div>

    <div class="flex flex-col rounded-2xl bg-white text-xl">
        <Dialog title="Spieler">
            {#snippet trigger()}
                <div class="flex flex-row items-center gap-3 px-6 py-4">
                    <UserIcon size={28} />
                    <p>Spieler</p>
                    <p class="ml-auto">{playerCount}</p>
                </div>
            {/snippet}

            <div class="size-full overflow-y-auto flex flex-col gap-3">
                {#each player as p, i}
                    <input
                        placeholder={`Spieler ${i + 1}`}
                        class="text-xl border-none outline-none animate-in animate-out fade-in zoom-in-50"
                        value={p}
                        oninput={(e) => updatePlayer(i, e.currentTarget.value)}
                    />
                    {#if i + 1 != player.length}
                        <div class="mx-2 border-b border-contrast/50"></div>
                    {/if}
                {/each}
            </div>
        </Dialog>

        <div class="mx-8 border-b border-contrast/50"></div>

        <Dialog title="Impostor">
            {#snippet trigger()}
                <div class="flex flex-row items-center gap-3 px-6 py-4">
                    <HatGlassesIcon size={28} />
                    <p>Impostor</p>

                    <p class="ml-auto">
                        {getImpostorCount()}
                    </p>
                </div>
            {/snippet}

            <div class="flex flex-col gap-3">
                {#if playerCount < minPlayers}
                    <p class="text-start text-black/50">
                        Bitte mindestens {minPlayers} Spieler hinzufügen
                    </p>
                {:else}
                    <div class="flex flex-row items-center justify-between">
                        <p class="text-xl">Zufällige Anzahl?</p>
                        <Switch bind:checked={randomImpostor} />
                    </div>

                    <div class="mx-2 border-b border-contrast/50"></div>
                    {#if randomImpostor}
                        <div class="w-full px-3 pt-10 pb-3">
                            <Slider
                                step={1}
                                min={1}
                                max={playerCount - 1}
                                bind:value={randomImpostorRange}
                                type="multiple"
                            />
                        </div>

                        <!--Change to Method-->
                        {#if randomImpostorRange[0] === randomImpostorRange[1]}
                            <p class="text-center text text-black">
                                {randomImpostorRange[0]} Impostor
                            </p>
                        {:else}
                            <p class="text-center text text-black">
                                {randomImpostorRange[0]} - {randomImpostorRange[1]} Impostor
                            </p>
                        {/if}
                    {:else}
                        <div class="w-full min-h-0 max-h-full flex flex-col gap-3 overflow-y-auto">
                            {#each selectedPlayers as p, i}
                                {#if i < playerCount - 1}
                                    <button
                                        class="text-xl flex flex-row items-center justify-between w-full"
                                        onclick={() => (selectedImpostorCount = i + 1)}
                                    >
                                        <p>
                                            {i + 1} Impostor
                                        </p>

                                        {#if i + 1 == selectedImpostorCount}
                                            <p class=" text-primary"><CheckIcon /></p>
                                        {/if}
                                    </button>

                                    {#if i != playerCount - 2}
                                        <div class="mx-2 border-b border-contrast/50"></div>
                                    {/if}
                                {/if}
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
        </Dialog>

        <div class="mx-8 border-b border-contrast/50"></div>

        <Dialog title="Kategorien">
            {#snippet trigger()}
                <div class="flex flex-row items-center gap-3 px-6 py-4">
                    <CircleDashedIcon size={28} />
                    <p>Kategorien</p>

                    <p class="ml-auto">{selectedCategories.length}</p>
                </div>
            {/snippet}

            <div class="w-full min-h-0 max-h-full flex flex-col gap-3 overflow-y-auto">
                {#each impostorCategories as impostorCategory, i}
                    <button
                        class="text-xl flex flex-row items-center justify-between w-full"
                        onclick={() => onCategorySelect(impostorCategory.id)}
                    >
                        <div class="flex flex-col items-start gap-1">
                            <p>
                                {impostorCategory.name}
                            </p>
                            <p class="text-sm">
                                {impostorCategory.description}
                            </p>
                        </div>

                        {#if selectedCategories.includes(impostorCategory.id)}
                            <p class=" text-primary"><CheckIcon /></p>
                        {/if}
                    </button>

                    {#if i != impostorCategories.length - 1}
                        <div class="mx-2 border-b border-contrast/50"></div>
                    {/if}
                {/each}
            </div>
        </Dialog>

        <div class="mx-8 border-b border-contrast/50"></div>

        <div class="flex flex-row items-center gap-3 px-6 py-4">
            <SearchIcon size={28} />
            <p>Hinweise</p>
            <Switch class="ml-auto" />
        </div>

        <div class="mx-8 border-b border-contrast/50"></div>

        <div class="flex flex-row items-center gap-3 px-6 py-4">
            <TimerIcon size={28} />
            <p>Zeitlimit</p>

            <Switch class="ml-auto" />
        </div>
    </div>

    <div class="flex flex-col rounded-2xl bg-white text-xl">
        <div class="flex flex-row items-center gap-3 px-6 py-4">
            <UserIcon size={28} />
            <p>Geräte</p>
        </div>
    </div>

    <div class="flex flex-col gap-2 items-center w-full mt-auto mb-10">
        {#if playerCount < minPlayers}
            <p class="text-red-500">Bitte mindestens {minPlayers} Spieler hinzufügen</p>
        {/if}
        <button
            class="bg-primary text-white rounded-xl px-6 py-3 font-semibold disabled:bg-primary/50 w-full"
            disabled={playerCount < minPlayers}
        >
            Spiel starten
        </button>
    </div>
</div>
