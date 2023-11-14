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
        Select
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import SveltyPicker from '../component/svelty-picker';

    // Intialization

    let createModal, actionsModals, deleteModal;
    let selectedRows = new Set();

    let data, createdObject={}, actionsIndex, actionsObject, userList;
    let handler, rows;
    const leadStatus = [
        {name:'Pending',value:'Pending'},
        {name:'In Process',value:'In Process'},
        {name:'Meeting',value:'Meeting'},
        {name:'Client Onboarding',value:'Client Onboarding'},
        {name:'Deal Closed',value:'Deal Closed'},
        {name:'Deal Failed',value:'Deal Failed'}
    ]
    let error="";

    // fetch data

    (async ()=>{
        userList = await utils.get('/api/employee/options');
        data = await utils.get('/api/lead/');
        
        if(data.status != 'success'){
            error = data.message;
            data = null;
        }else{
            data = data.data;

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
    $: buttonDisabled = selectedRows.size == 0;

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

    async function openActionsModal(e){
        let oid = e.target.innerText;
        data.find((e,i) => {
            if(e.id == oid){
                actionsIndex = i;
                return true;
            }
        });

        actionsObject = await utils.get('/api/lead/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
            return;
        }

        actionsObject = actionsObject.data;
        
        actionsModals = true;
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
        link.download = 'Leads.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

    async function updateData(){
        const resp = await utils.put_json('/api/lead/',actionsObject);

        if(resp.status == 'success'){
            resp.data._selected = data[actionsIndex]._selected;
            resp.data.assigned_user = userList.find(e => e.value == resp.data.assigned_to);
            resp.data.assigned_user.username = resp.data.assigned_user.name;

            data[actionsIndex] = resp.data;
            handler.setRows(data);
            actionsModals = false;
        }else{
            error = resp.message || "";
        }
        
    }

    async function deleteSelected(){
        const resp = await utils._delete('/api/lead/destroy/',{id:Array.from(selectedRows)});

        if(resp.status == 'success'){
            for (let i = 0; i < data.length; i++) {
                if (selectedRows.has(data[i].id)) {
                    data.splice(i, 1);
                    i--;
                }
            }
            selectedRows.clear();
            handler.setRows(data);
            selectedRows = selectedRows;
        }else{
            error = resp.message;
        }
    }

    async function createData(){
        let resp = await utils.post_json('/api/lead/',createdObject);

        if(resp.status == 'success'){
            resp.data._selected = false;
            resp.data.assigned_user = userList.find(e => e.value == resp.data.assigned_to);
            resp.data.assigned_user.username = resp.data.assigned_user.name;

            data.push(resp.data);
            handler.setRows(data);
            createModal = false;
        }else{
            error = resp.message || "";
        }
    }

</script>
{#if data && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">
            <Button gradient color="blue" on:click={()=> createModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>                        
                &nbsp;
                Create
            </Button>

            <Button gradient color="green" on:click={download}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>                          
                &nbsp;
                Download
            </Button>

            <Button disabled={buttonDisabled} gradient color="red" on:click={()=> deleteModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>              
                &nbsp;
                Delete
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
                            <Th {handler} orderBy="id">id</Th>
                            <Th {handler} orderBy="client">Client</Th>
                            <Th {handler} orderBy={row => row.assigned_user.username}>Assigned To</Th>
                            <Th {handler} orderBy="status">Status</Th>
                            <Th {handler} orderBy="started">Started</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client || "-"}/>
                            <ThSearch {handler} filterBy={row => row.assigned_user.username || "-"}/>
                            <ThSearch {handler} filterBy={row => row.status || "-"}/>
                            <ThSearch {handler} filterBy={row => row.started || "-"}/>
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
                                    {row.client || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.assigned_user.username || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.status || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.started || "-"}
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

<Modal bind:open={deleteModal} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete selected rows?</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Create Entry</h3>
        <Label class="space-y-2">
            <span>Client Name</span>
            <Input required bind:value={createdObject.client}/>
        </Label>
        <Label class="space-y-2">
            <span>Start date</span>
            <SveltyPicker format="d M yyyy" bind:value={createdObject.started}/>
        </Label>
        <Label class="space-y-2">
            <span>Assigned To</span>
            <Select required items={userList} bind:value={createdObject.assigned_to} />
        </Label>
        <Label class="space-y-2">
            <span>Status</span>
            <Select required items={leadStatus} bind:value={createdObject.status}/>
        </Label>
        <Label class="space-y-2 col-span-2">
            <span>Description</span>
            <Textarea placeholder="Description" rows="4" bind:value={createdObject.description}/>
        </Label>
        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject={}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">View/Update Entry</h3>
        <Label class="space-y-2">
            <span>Client Name</span>
            <Input required bind:value={actionsObject.client}/>
        </Label>
        <Label class="space-y-2">
            <span>Start date</span>
            <SveltyPicker format="d M yyyy" bind:value={actionsObject.started}/>
        </Label>
        <Label class="space-y-2">
            <span>Assigned To</span>
            <Select items={userList} bind:value={actionsObject.assigned_to} />
        </Label>
        <Label class="space-y-2">
            <span>Status</span>
            <Select items={leadStatus} bind:value={actionsObject.status}/>
        </Label>
        <Label class="space-y-2 col-span-2">
            <span>Description</span>
            <Textarea placeholder="Description" rows="4" bind:value={actionsObject.description}/>
        </Label>
        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button  type="submit" class="w-full">Update</Button>
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