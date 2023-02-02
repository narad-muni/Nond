<script>
  import { Input } from "flowbite-svelte";

    export let handler
    export let filterBy = null
    let value = ''
</script>


<th>
    <Input
        class="border-0 !rounded-none border-b-2"
        type="text"
        placeholder="Filter"
        bind:value
        on:input={() => handler.filter(value, filterBy)}
    />
</th>