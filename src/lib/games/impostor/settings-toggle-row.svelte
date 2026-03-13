<script lang="ts">
	import Switch from "$lib/ui/switch.svelte";
	import type { Snippet } from "svelte";

	type Props = {
		children: Snippet;
		label: string;
		description?: string;
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		children,
		label,
		description,
		checked = $bindable(false),
		onCheckedChange,
	}: Props = $props();
</script>

<div class="flex flex-row items-start gap-3 px-6 py-4">
	<div class="pt-0.5">
		{@render children()}
	</div>

	<div class="flex flex-col gap-1">
		<p>{label}</p>
		{#if description}
			<p class="text-sm text-black/60">{description}</p>
		{/if}
	</div>

	<Switch class="ml-auto mt-0.5" bind:checked {onCheckedChange} />
</div>
