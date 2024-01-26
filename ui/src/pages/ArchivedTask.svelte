<script>
    //Imports

    import {
        Button,
        Modal,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        Checkbox,
        Label,
        Input,
        Alert,
        Textarea,
        Select,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import SveltyPicker from '../component/svelty-picker';
    import utils from '../utils';

    // Intialization

    let actionsModals;
    let selectedRows = new Set();

    let data, actionsIndex, actionsObject, userList;
    let handler, rows, selfTasks = true;

    let error="";

    // fetch data

    (async ()=>{
        data = await utils.get('/api/task/archived/'+selfTasks);
        userList = await utils.get('/api/employee/options');

        if(data.status != 'success'){
            error = data.message;
            data = null;
        }else{
            data = data.data;
            userList = [{name: "Unassigned", value: null}, ...userList];

            data.forEach((v) => {
                v["_selected"] = false;
            });

            handler = new DataHandler(
                data,
                {
                    rowsPerPage:50
                }
            )

            rows = handler.getRows();
        }
    })()

    //Reactive variables

    $: checked = utils.compareSets(selectedRows,new Set(($rows||[]).map(i => parseInt(i.id)))); // $rows||[] is used to wait and not fail
    $: indeterminate = selectedRows.size > 0 && !checked;

    //Functions

    function addSelection(e){
        
        let id = e.target.getAttribute('oid');// get object id, which is primary key in db

        if(id){ // if oid is passed, then element is column
            if(e.target.checked){
                selectedRows.add(parseInt(id));
            }else{
                selectedRows.delete(parseInt(id));
            }

        }else{//element is column, global checkbox
            if(e.target.checked){

                $rows.forEach((r) => {
                    r._selected = true;
                    selectedRows.add(parseInt(r.id));
                });

            }else{

                $rows.forEach((r) => {
                    r._selected = false;
                    selectedRows.delete(parseInt(r.id));
                });

            }
        }

        selectedRows = selectedRows;
        handler.setRows(data);
    }

    async function changeFilter(){

        /**
         * 0 - Not Billed / Completed
         * 1 - All
         * 2 - Billed / Completed
        */

        selfTasks = !selfTasks;

        const resp = await utils.get('/api/task/archived/'+selfTasks);

        if(resp.status == 'success'){
            data = resp.data;

            const temp_selection = new Set();

            data.forEach((v) => {
                if(selectedRows.has(v.id)){
                    v["_selected"] = true;
                    temp_selection.add(v.id);
                }else{
                    v["_selected"] = false;
                }
            });

            selectedRows = temp_selection;

            handler.setRows(data);
        }else{
            error = resp.message || "";
        }
    }

    async function openActionsModal(e){
        let oid = e.target.innerText;
        data.find((e,i) => {
            if(e.id == oid){
                actionsIndex = i;
                return true;
            }
        });

        actionsObject = await utils.get('/api/task/archived/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
        }else{
            actionsObject = actionsObject.data;
            actionsModals = true;
        }
    }

    function escapeCSV(original_row){
        let row = structuredClone(original_row);
        for(let i = 0; i < row.length; i++){
            row[i] = '"'+row[i].replaceAll(/"/g,'""')+'"';
        };
        return row;
    }
    
    function download(){
        const table = document.querySelector('#table');
        let headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);

        headers = headers.slice(0,headers.length/2);

        let rows = Array.from(table.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => {
            if(td.querySelector('a')){
                return td.querySelector('a').href;
            }else if(td.querySelector('input[type=checkbox]')){
                return td.querySelector('input[type=checkbox]').checked ? 'Yes' : 'No';
            }else{
                return td.textContent;
            }
        }));

        rows = rows.slice(2);

        if(indeterminate){
            rows = rows.filter(e => e[0] == 'Yes');
        }

        const data = [headers, ...rows];
        
        // Convert the table data to CSV format
        const csv = data.map(row => escapeCSV(row).join(',')).join('\n');
        
        // Create a Blob object from the CSV string
        const blob = new Blob([csv], { type: 'text/csv' });
        
        // Create a link to download the CSV file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'ArchivedTasks.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

</script>
{#if data  && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">

            <Button gradient color="green" id="owner" on:click={changeFilter}>
                <svg xmlns="http://www.w3.org/2000/svg" id="owner" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                &nbsp;
                {#if selfTasks}
                    My Tasks
                {:else}
                    All Tasks
                {/if}
            </Button>

            <Button gradient color="green" on:click={download}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>                          
                &nbsp;
                Download
            </Button>

        </div>

        <div class="min-h-0 pl-4 mt-4">
            <DataTable {handler}>
                <Table id="table">
                    <thead>
                        <tr>
                            <th>
                                <Checkbox on:change={addSelection} {checked} {indeterminate}/>
                            </th>
                            <Th {handler} orderBy={row => row.id || "-"}>id</Th>
                            <Th {handler} orderBy={row => row.title || "-"}>Title</Th>
                            <Th {handler} orderBy={row => row.client || "-"}>Client</Th>
                            <Th {handler} orderBy={row => row.group || "-"}>Group</Th>
                            <Th {handler} orderBy={row => row.service || "-"}>Service</Th>
                            <Th {handler} orderBy={(row => row.assigned_to || "Unassigned")}>Assigned To</Th>
                            <Th {handler} orderBy={row => row.created || "-"}>Created At</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.title || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client || "-"}/>
                            <ThSearch {handler} filterBy={row => row.group || "-"}/>
                            <ThSearch {handler} filterBy={row => row.service || "-"}/>
                            <ThSearch {handler} filterBy={(row => row.assigned_to || "Unassigned")}/>
                            <ThSearch {handler} filterBy={row => row.created || "-"}/>
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                </TableBodyCell>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" on:click={openActionsModal} >{row.id}</TableBodyCell>
                                <TableBodyCell>
                                    {row.title || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.client || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.group || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.service || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.assigned_to || "Unassigned"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.created || "-"}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </DataTable>
        </div>
    </main>
{/if}

<!-- Modal -->

<!-- Modals -->

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">View/Update Entry</h3>
        <Label class="space-y-2 col-span-2">
            <span>Title</span>
            <Input type="text" bind:value={actionsObject.title}/>
        </Label>
        <Label class="space-y-2">
            <span>Service</span>
            <Input type="text" bind:value={actionsObject.service}/>
        </Label>
        <Label class="space-y-2">
            <span>Client</span>
            <Input type="text" bind:value={actionsObject.client}/>
        </Label>
        <Label class="space-y-2">
            <span>Group</span>
            <Input type="text" bind:value={actionsObject.group}/>
        </Label>
        <Label class="space-y-2">
            <span>Assigned To</span>
            <Input type="text" bind:value={actionsObject.assigned_to}/>
        </Label>
        <Label class="space-y-2 col-span-3">
            <span>Description</span>
            <Textarea placeholder="Description" rows="4" bind:value={actionsObject.description}/>
        </Label>

        <div class="grid gap-2 col-span-3 grid-cols-7">
            <Label class="space-y-2 text-center col-span-2">
                <span>User</span>
            </Label>
            <Label class="space-y-2 text-center col-span-3">
                <span>Description</span>
            </Label>
            <Label class="space-y-2 text-center col-span-1">
                <span>Time (Hrs)</span>
            </Label>

            {#each actionsObject.time as particular,index}

                <Select readonly items={userList} class="col-span-2 !m-0" bind:value={particular.user} />

                <Input readonly required class="col-span-3" bind:value={particular.description} />
                <SveltyPicker format="hh:ii" bind:value={particular.time} />
            {/each}

            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={actionsObject.total_time}/>
            </Label>
        </div>

        <div class="grid gap-2 col-span-3 grid-cols-7">
            <Label class="space-y-2 text-center col-span-2">
                <span>User</span>
            </Label>
            <Label class="space-y-2 text-center col-span-3">
                <span>Description</span>
            </Label>
            <Label class="space-y-2 text-center col-span-1">
                <span>Amount</span>
            </Label>

            {#each actionsObject.money as particular,index}

                <Select readonly items={userList} class="col-span-2 !m-0" bind:value={particular.user} />
                
                <Input readonly required class="col-span-3" bind:value={particular.description} />
                <Input readonly required bind:value={particular.amount} type="number" />
            {/each}

            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={actionsObject.total_money}/>
            </Label>
        </div>

        <div class="col-span-3 grid gap-6 grid-cols-1">
            <Button on:click={()=>actionsModals=false} color="alternative" class="w-full">Close</Button>
        </div>
    </form>
</Modal>

<!--Alerts-->

{#if error.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}