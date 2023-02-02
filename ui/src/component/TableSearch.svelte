<script>
  import { Input } from "flowbite-svelte";

    export let handler
    let value = ''
</script>

<Input
    class="!w-[25%]"
    placeholder="Search..."
    bind:value={value} 
    on:input={() => handler.search(value)}
/>

<style>
</style>