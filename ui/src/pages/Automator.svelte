<script>
    import { onMount } from 'svelte';
    import utils from "../utils";
    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";

    import {
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        Alert,
        Modal
    } from "flowbite-svelte";
    
    let automators = [], error = "", handler, rows, deleteId, logs, viewLogModal;

    async function refresh_status(){
        const resp = await utils.get("/api/automator");
        if(resp.status == 'success'){
            automators = resp.data;
            handler = new DataHandler(
                automators,
                {
                    rowsPerPage:50
                }
            )

            rows = handler.getRows();
        }else{
            error = resp.message;
            automators = [];
        }
    }

    async function deleteAutomatorLog(id){
        await utils._delete(`/api/automator/destroy/${id}`);
        await refresh_status();
        deleteId = false;
    }

    async function viewLogs(id){
        const resp = await utils.get(`/api/automator/${id}`);

        if(resp.status == 'success'){
            logs = resp.data.data;
        }else{
            error = resp.message;
        }
    }

    onMount(async () => {
        await refresh_status();
    });

</script>

{#if automators && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">

        <div class="min-h-0 pl-4 mt-4">
            <DataTable {handler}>
                <Table id="table">
                    <thead>
                        <tr>
                            <Th {handler} orderBy="id">ID</Th>
                            <Th {handler} orderBy="name">Name</Th>
                            <Th {handler} orderBy="email">Email</Th>
                            <Th {handler} orderBy="gst">GST</Th>
                            <Th {handler} orderBy="pan">Pan</Th>
                            <Th {handler} orderBy={(row => row.group?.name)}>Group</Th>
                            <Th {handler}>Actions</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.email || "-"}/>
                            <ThSearch {handler} filterBy={row => row.gst || "-"}/>
                            <ThSearch {handler} filterBy={row => row.pan || "-"}/>
                            <ThSearch {handler} filterBy={(row => row.group?.name || "-")}/>
                            <ThSearch {handler}/>
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row}
                            <TableBodyRow>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" >{row.id}</TableBodyCell>
                                <TableBodyCell>{row.user.username || "-"}</TableBodyCell>
                                <TableBodyCell>{row.name || "-"}</TableBodyCell>
                                <TableBodyCell>{row.status || "-"}</TableBodyCell>
                                <TableBodyCell>{row.created_on || "-"}</TableBodyCell>
                                <TableBodyCell><Button on:click={() => viewLogs(row.id)}>view logs</Button></TableBodyCell>
                                <TableBodyCell>
                                    <Button color="red" on:click={() => deleteId = row.id}>Delete</Button>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </DataTable>
        </div>
    </main>
{/if}

<Modal bind:open={deleteId} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this log?</h3>
        <Button color="red" on:click={() => deleteAutomatorLog(deleteId)} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={logs} size="xl" autoclose>
    <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>

        {#each Object.entries(logs) as [invoice, data]}
            {#if invoice != 'temp_path'}
                {#if data.success == true}
                    <p class="text-left text-green-500">{invoice} - {data.message}</p>
                {:else}
                    <p class="text-left text-red-500">{invoice} - {data.message}</p>
                {/if}
            {/if}
        {/each}

        <Button class="mt-5" on:click={() => logs = false} color='alternative'>Close</Button>
    </div>
</Modal>

{#if error.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}