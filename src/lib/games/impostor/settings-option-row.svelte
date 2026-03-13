<script lang="ts">
	import { CheckIcon } from "@lucide/svelte";

	type Props = {
		label: string;
		description?: string;
		selected?: boolean;
		disabled?: boolean;
		onclick?: () => void;
	};

	let {
		label,
		description,
		selected = false,
		disabled = false,
		onclick,
	}: Props = $props();
</script>

<button
	class="text-xl flex w-full flex-row items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
	{disabled}
	{onclick}
>
	<div class="flex flex-col items-start gap-1">
		<p>{label}</p>
		{#if description}
			<p class="text-sm text-black/60">{description}</p>
		{/if}
	</div>

	{#if selected}
		<p class="shrink-0 text-primary"><CheckIcon /></p>
	{/if}
</button>
