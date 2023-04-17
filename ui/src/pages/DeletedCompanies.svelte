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
        A,
        Label,
        Input,
        Toggle,
        Alert
    } from "flowbite-svelte";

    import { DataHandler } from "@vincjo/datatables";
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import SveltyPicker from 'svelty-picker';

    // Intialization

    let actionsModals, deleteModal, allColumns = false;
    let selectedRows = new Set();

    let headers, data, actionsIndex, actionsObject;
    let handler, rows;
    let error="";

    // fetch data

    (async ()=>{
        headers = await utils.get('/api/master_template/options/companies');
        data = await utils.get('/api/company/master/true');

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

        }else{//element is header, global checkbox
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
        data.every((el,i) => {
            if(el.id == oid){
                actionsIndex = i;
                return false;
            }
            return true;
        });

        actionsObject = await utils.get('/api/company/'+data[actionsIndex].id);

        if(actionsObject.status == 'success'){
            actionsObject = actionsObject.data;
            actionsModals = true;
        }else{
            error = actionsObject.message || "";
        }
    }

    async function reloadData(){
        if(allColumns){
            data = await utils.get('/api/company/true');
        }else{
            data = await utils.get('/api/company/master/true');
        }

        selectedRows.clear();
        selectedRows = selectedRows;
        handler.setRows(data);
    }

    async function viewAllColumns(){
        allColumns = !allColumns;

        if(allColumns){
            data = await utils.get('/api/company/true');
        }else{
            data = await utils.get('/api/company/master/true');
        }

        data.forEach((v) => {
            if(selectedRows.has(v["id"])){
                v["_selected"] = true;
            }else{
                v["_selected"] = false;
            }
        });

        handler.setRows(data);
    }
    
    async function download(){
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
        const csv = data.map(row => row.join(',')).join('\n');
        
        // Create a Blob object from the CSV string
        const blob = new Blob([csv], { type: 'text/csv' });
        
        // Create a link to download the CSV file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Invoices.csv';
        
        // Programmatically click on the link to initiate the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function deleteSelected(){
        for (let i = 0; i < data.length; i++) {
            if (selectedRows.has(data[i].id)) {
                data.splice(i, 1);
                i--;
            }
        }

        await utils._delete('/api/company/destroy/',{id: Array.from(selectedRows)});

        selectedRows.clear();
        handler.setRows(data);
        selectedRows = selectedRows;
    }

    async function restoreData(){
        for (let i = 0; i < data.length; i++) {
            if (selectedRows.has(data[i].id)) {
                data.splice(i, 1);
                i--;
            }
        }

        await utils.post_json('/api/company/restore/',{id: Array.from(selectedRows)});

        selectedRows.clear();
        handler.setRows(data);
        selectedRows = selectedRows;
    }

</script>

{#if data && headers && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">
            <Button gradient color="blue" on:click={restoreData}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                &nbsp;
                Restore
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

            <Button gradient color="teal" on:click={viewAllColumns}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>                     
                &nbsp;
                {#if allColumns}
                    All Columns
                {:else}
                    Master Columns
                {/if}
            </Button>

            <Button color="alternative" on:click={reloadData}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
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
                            <Th {handler} orderBy="id">ID</Th>
                            <Th {handler} orderBy="name">Name</Th>
                            <Th {handler} orderBy="email">Email</Th>
                            <Th {handler} orderBy="email">Pan</Th>
                            <Th {handler} orderBy="gst">GST</Th>
                            <Th {handler} orderBy="singature">Signature</Th>
                            {#each headers.data as header}
                                {#if allColumns || header.is_master}
                                    <Th {handler} orderBy={header.column_name}>{header.display_name}</Th>
                                {/if}
                            {/each}
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}></ThSearch>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.email || "-"}/>
                            <ThSearch {handler} filterBy={row => row.pan || "-"}/>
                            <ThSearch {handler} filterBy={row => row.gst || "-"}/>
                            <ThSearch {handler} filterBy={row => row.signature || "-"}/>
                            {#each headers.data as header}
                                {#if allColumns || header.is_master}
                                    <ThSearch {handler} filterBy={header.column_name}/>
                                {/if}
                            {/each}
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row, index}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                </TableBodyCell>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" on:click={openActionsModal} >{row.id}</TableBodyCell>
                                <TableBodyCell>{row.name || "-"}</TableBodyCell>
                                <TableBodyCell>{row.email || "-"}</TableBodyCell>
                                <TableBodyCell>{row.pan || "-"}</TableBodyCell>
                                <TableBodyCell>{row.gst || "-"}</TableBodyCell>
                                <TableBodyCell>
                                    {#if row.signature}
                                        <A target="_blank" href={row.signature}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                            </svg>
                                            &nbsp;
                                            Signature
                                        </A>
                                    {:else}
                                        null
                                    {/if}
                                </TableBodyCell>
                                {#each headers.data as header}
                                    {#if allColumns || header.is_master}
                                        <TableBodyCell>
                                            {#if header.column_type == 'Text'}
                                                {row[header.column_name] || "-"}
                                            {:else if header.column_type == 'File'}
                                                {#if row[header.column_name]}
                                                    <A target="_blank" href={row[header.column_name]}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                        </svg>
                                                        &nbsp;
                                                        {header.display_name}
                                                    </A>
                                                {:else}
                                                    -
                                                {/if}
                                            {:else if header.column_type == 'Date'}
                                                {row[header.column_name] || "-"}
                                            {:else}
                                                <Checkbox disabled checked={row[header.column_name]=="true" || row[header.column_name]}/>
                                            {/if}
                                        </TableBodyCell>
                                    {/if}
                            {/each}
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

<Modal bind:open={actionsModals} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">View/Update Company</h3>
        <Label class="space-y-2">
            <span>ID</span>
            <Input readonly type="text" bind:value={actionsObject.id} />
        </Label>

        <Label class="space-y-2">
            <span>Name</span>
            <Input type="text" bind:value={actionsObject.name} />
        </Label>

        <Label class="space-y-2">
            <span>Email</span>
            <Input type="email" bind:value={actionsObject.email} />
        </Label>

        <Label class="space-y-2">
            <span>Address</span>
            <Input type="text" bind:value={actionsObject.address} />
        </Label>

        <Label class="space-y-2">
            <span>Pan</span>
            <Input type="text" bind:value={actionsObject.pan} />
        </Label>

        <Label class="space-y-2">
            <span>GST</span>
            <Input type="text" bind:value={actionsObject.gst} />
        </Label>

        <Label class="space-y-2">
            {#if actionsObject.signature}
                <span>Signature</span>
                <div class="flex justify-between">
                    <A target="_blank" href={actionsObject.signature}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        &nbsp;
                        Signature
                    </A>
                    <Button on:click={() => {actionsObject.signature = null}} gradient color="red">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>                                  
                    </Button>
                </div>
            {:else}
                <p>Signature</p>
                <input required type="file" on:input={event => actionsObject["signature"]=event.target.files[0]} class="w-full border border-gray-300 rounded-lg cursor-pointer" />
            {/if}
        </Label>

        {#each headers.data as header}
            {#if header!="id"}
                <Label class="space-y-2">
                    {#if header.column_type=="Text"}
                        <span>{header.display_name}</span>
                        <Input bind:value={actionsObject[header.column_name]}/>
                    {:else if header.column_type=="Date"}
                        <span>{header.display_name}</span>
                        <SveltyPicker format="M d, yyyy" bind:value={actionsObject[header.column_name]} />
                    {:else if header.column_type=="Checkbox"}
                        <span>&nbsp;</span>
                        <Toggle  bind:value={actionsObject[header.column_name]} bind:checked={actionsObject[header.column_name]}>{header.display_name}</Toggle>
                    {:else}
                        {#if typeof(actionsObject[header.column_name]) == 'string'}
                            <span>{header.display_name}</span>
                            <div class="flex justify-between">
                                <A target="_blank" href={actionsObject[header.column_name]}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    &nbsp;
                                    {header.display_name}
                                </A>
                                <Button on:click={() => {actionsObject[header.column_name] = null}} gradient color="red">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>                                  
                                </Button>
                            </div>
                        {:else}
                            <p>{header.display_name}</p>
                            <input type="file" on:input={event => actionsObject[header.column_name]=event.target.files[0]} class="w-full border border-gray-300 rounded-lg cursor-pointer" />
                        {/if}
                    {/if}
                </Label>
            {/if}
        {/each}

        <Label class="space-y-2">
            <span>SMTP Host</span>
            <Input type="text" bind:value={actionsObject.smtp_host} />
        </Label>

        <Label class="space-y-2">
            <span>SMTP Port</span>
            <Input type="text" bind:value={actionsObject.smtp_port} />
        </Label>

        <Label class="space-y-2">
            <span>SMTP Email</span>
            <Input type="text" bind:value={actionsObject.smtp_email} />
        </Label>

        <Label class="space-y-2">
            <span>SMTP Password</span>
            <Input type="text" bind:value={actionsObject.smtp_password} />
        </Label>
        
        <div class="col-span-2 grid gap-6 grid-cols-1">
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