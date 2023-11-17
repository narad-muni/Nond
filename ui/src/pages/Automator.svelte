<script>
    import { onMount ,onDestroy } from 'svelte';
    import utils from "../utils";
    import { user } from '../global/stores';
    import { Accordion, AccordionItem, Card } from 'flowbite-svelte';
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
    } from "flowbite-svelte";
    
    let automators = [], error = "", handler, rows;

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

    async function viewLogs(logs){
        console.log(logs)
    }

    async function deleteAutomatorLog(id){
        await utils._delete(`/api/automator/destroy/${id}`);
        await refresh_status();
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
                                <TableBodyCell><Button on:click={() => viewLogs(row.data)}>view logs</Button></TableBodyCell>
                                <TableBodyCell>
                                    <Button color="red" on:click={() => deleteAutomatorLog(row.id)}>Delete</Button>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </DataTable>
        </div>
    </main>
{/if}

<div class="mt-5 mx-5">
    {#each automators as automator}
        <Card>
            <p>{automator.name}</p>
            <p>{automator.message}</p>
            <p>{automator.status}</p>
            <p>{automator.created_on}</p>
            <Button color="red" on:click={() => deleteAutomatorLog(automator.id)}>Delete</Button>
            <Accordion>
                <AccordionItem>
                    <span slot="header">Logs</span>
                    {#each Object.entries(automator.data) as [invoice, data]}
                        {#if invoice != 'temp_path'}
                            {#if data.success == true}
                                <p class="text-green-500">{invoice} - {data.message}</p>
                            {:else}
                                <p class="text-red-500">{invoice} - {data.message}</p>
                            {/if}
                        {/if}
                    {/each}
                </AccordionItem>
            </Accordion>
        </Card>
    {/each}
</div>

{#if error.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}