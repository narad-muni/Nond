<script>
    export let handler

    const rowsPerPage = handler.getRowsPerPage()

    const options = [10, 25, 50, 100, "All"]
    const values = [10, 25, 50, 100, 0]
</script>


<aside>
    <p>{handler.i18n.show}</p>
    <select bind:value={$rowsPerPage}>
        {#each options as option, i}
            <option value={values[i]}>
                {option}
            </option>
        {/each}
    </select>
    <p>{handler.i18n.entries}</p>
</aside>


<style>
    aside{
        display:flex;
        justify-content:flex-start;
        align-items: center;
        height:32px;
        color:#616161;
    }
    select{
        margin:0 4px;
    }
</style>