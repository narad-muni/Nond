<script>
    import { Input, Select } from "flowbite-svelte";

    export let handler
    export let filterBy = null

    let filterType = "like";
    let value = ''

    const filterTypeOptions = [
        {name: "Like", value: "like"},
        {name: "Not Like", value: "not like"},
        {name: "Equals", value: "equals"},
        {name: "Not Equals", value: "not equals"},
        {name: "Less Than", value: "less than"},
        {name: "Greater Than", value: "greater than"},
    ];
</script>


<th>
    <Input
        class="border-0 !rounded-none border-b-[1px]"
        type="text"
        placeholder="Filter"
        bind:value
        on:input={() => handler.filter(value, filterBy, filterType)}
    />

    <Select
        class="border-0 !rounded-none border-b-2"
        items = {filterTypeOptions}
        bind:value = {filterType}
        on:input={() => handler.filter(value, filterBy, filterType)}
    >
    </Select>
</th>