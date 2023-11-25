<script>
    import TableSearch from './TableSearch.svelte';
    import RowsPerPage from './RowsPerPage.svelte';
    import RowCount from './RowCount.svelte';
    import Pagination from './Pagination.svelte';
    import { Button } from 'flowbite-svelte';
    import { filter_visible } from '../global/stores';

    export let handler;
    let element;
    let clientWidth = 1000

    const triggerChange = handler.getTriggerChange()
    $: $triggerChange, scrollTop()

    const scrollTop = () => {
        if (element) element.scrollTop = 0
    }
</script>


<section bind:clientWidth={clientWidth}>
    <header>
        <TableSearch {handler}/>
        <Button on:click={() => $filter_visible = $filter_visible == 'hidden' ? '' : 'hidden'}>
            {#if $filter_visible == 'hidden'}
                Show Filters
            {:else}
                Hide Filters
            {/if}
        </Button>
        <RowsPerPage {handler}/>
    </header>

    <article class="border-2 mt-4" bind:this={element}>
        <slot/>
    </article>

    <footer>
        <RowCount   {handler} small={clientWidth < 600}/>
        <Pagination {handler} small={clientWidth < 600}/>
    </footer>
</section>



<style>
    section {
        height: 100%;
    }

    section :global(table) {
        text-align:center;
        border-collapse:separate;
        border-spacing:0;
        width:100%;
    }

    section :global(thead) {
        position:sticky;
        inset-block-start:0;
    }

    header, footer {
        height:48px;
        padding-right:16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
    }

    footer{ 
        border-top: 1px solid #e0e0e0;
    }

    article {
        position:relative;
        height:calc(100% - 96px);
        overflow:auto;
        scrollbar-width:thin;
    }

    article::-webkit-scrollbar {width: 6px;height: 6px;}
    article::-webkit-scrollbar-track {background: #f5f5f5;}
    article::-webkit-scrollbar-thumb {background: #c2c2c2;}
    article::-webkit-scrollbar-thumb:hover {background: #9e9e9e;}

</style>