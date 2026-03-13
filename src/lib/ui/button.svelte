<script lang="ts">
    import { Button } from "bits-ui";

    let { children } = $props();
</script>

<Button.Root
    class="h-12 border-2 border-black bg-[#A6FAFF] p-2.5 hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF]">
    {@render children()}
</Button.Root>
