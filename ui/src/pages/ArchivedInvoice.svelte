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
        Toggle,
        Textarea,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import SveltyPicker from '../component/svelty-picker';

    // Intialization

    let actionsModals, deleteModal, filterStatus=3;
    let selectedRows = new Set();

    let data, actionsIndex, actionsObject = {};
    let handler, rows;
    let error="";

    // fetch data

    (async ()=>{
        data = await utils.get('/api/invoice/archived/filter/'+filterStatus);
        
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
    })();

    //Reactive variables

    $: checked = utils.compareSets(selectedRows,new Set(($rows||[]).map(i => i.id))); // $rows||[] is used to wait and not fail
    $: indeterminate = selectedRows.size > 0 && !checked;
    $: buttonDisabled = selectedRows.size == 0;
    
    $: actionsObject.total = actionsObject?.particulars?.particulars.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);

    $: actionsObject.tax = actionsObject?.particulars?.particulars.reduce((a,b) => a+ (b.amount*b.gst*.01), 0);

    //Functions

    function addSelection(e){
        
        let id = e.target.getAttribute('oid');// get object id, which is primary key in db

        if(id){ // if oid is passed, then element is column
            if(e.target.checked){
                selectedRows.add(id);
            }else{
                selectedRows.delete(id);
            }

        }else{//element is column, global checkbox
            if(e.target.checked){

                $rows.forEach((r) => {
                    r._selected = true;
                    selectedRows.add(r.id);
                });

            }else{

                $rows.forEach((r) => {
                    r._selected = false;
                    selectedRows.delete(r.id);
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

        actionsObject = await utils.get('/api/invoice/archived/'+data[actionsIndex].id);

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
        link.download = 'ArchivedInvoices.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

    async function downloadBill(){

    }

</script>
{#if data && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">

            <Button disabled={buttonDisabled} gradient color="green" on:click={()=> deleteModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>                  
                &nbsp;
                Send To Clients
            </Button>

            <Button gradient color="blue" on:click={download}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>                         
                &nbsp;
                Download
            </Button>

            <Button disabled={buttonDisabled} gradient color="blue" on:click={downloadBill}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                &nbsp;
                Download Invoices
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
                            <Th {handler} orderBy={row => row.id || "-"}>ID</Th>
                            <Th {handler} orderBy={row => row.client}>Client</Th>
                            <Th {handler} orderBy={row => row.group}>Group</Th>
                            <Th {handler} orderBy={row => row.total || "-"}>Total</Th>
                            <Th {handler} orderBy={row => row.tax || "-"}>Tax</Th>
                            <Th {handler} orderBy={row => row.paid ? "Yes" : "No"}>Paid</Th>
                            <Th {handler} orderBy={row => row.gst ? "Yes" : "No"}>GST</Th>
                            <Th {handler} orderBy={row => row.company}>Company</Th>
                            <Th {handler} orderBy={row => row.date || "-"}>Date</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client || "-"}/>
                            <ThSearch {handler} filterBy={row => row.group || "-"}/>
                            <ThSearch {handler} filterBy={row => row.total || "-"}/>
                            <ThSearch {handler} filterBy={row => row.tax || "-"}/>
                            <ThSearch {handler} filterBy={row => row.paid ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.gst ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.company || "-"}/>
                            <ThSearch {handler} filterBy={row => row.date || "-"}/>
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
                                    {row.group || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.total || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.tax || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.paid ? "Yes" : "No"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.gst ? "Yes" : "No"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.company || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.date || "-"}
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
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">View/Update Entry</h3>
        <Label class="space-y-2">
            <span>Invoice ID</span>
            <Input value={actionsObject.id} readonly/>
        </Label>
        
        <Label class="space-y-2">
            <span>Client</span>
            <Input value={actionsObject.client} readonly/>
        </Label>

        <Label class="space-y-2">
            <span>Group</span>
            <Input value={actionsObject.group} readonly/>
        </Label>

        <Label class="space-y-2">
            <span>Company</span>
            <Input value={actionsObject.company} readonly/>
        </Label>

        <Label class="space-y-2">
            <span>Date</span>
            <SveltyPicker format="d M yyyy" required bind:value={actionsObject.date}/>
        </Label>

        <Label class="space-y-2">
            <span>&nbsp;</span>
            <Toggle bind:value={actionsObject.paid} bind:checked={actionsObject.paid}>Paid</Toggle>
        </Label>

        <Label class="space-y-2">
            <span>&nbsp;</span>
            <Toggle bind:value={actionsObject.gst} bind:checked={actionsObject.gst}>GST</Toggle>
        </Label>
        
        <Label class="space-y-2">
            <span>Remarks</span>
            <Textarea bind:value={actionsObject.remarks}/>
        </Label>

        <Label class="space-y-2">
            <span>Note for self</span>
            <Textarea bind:value={actionsObject.note}/>
        </Label>

        {#if actionsObject.gst}
            <div class="grid gap-2 col-span-3 grid-cols-10">
                <Label class="space-y-2 text-center col-span-2">
                    <span>Master</span>
                </Label>
                <Label class="space-y-2 text-center col-span-4">
                    <span>Description</span>
                </Label>
                <Label class="space-y-2 text-center col-span-1">
                    <span>GST</span>
                </Label>
                <Label class="space-y-2 text-center col-span-1">
                    <span>HSN</span>
                </Label>
                <Label class="space-y-2 text-center col-span-1">
                    <span>Amount</span>
                </Label>
                {#each actionsObject.particulars.particulars as particular}
                    <Input required class="col-span-2 !m-0" bind:value={particular.master} />
                    <Input required class="col-span-4" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.gst} />
                    <Input required class="col-span-1" bind:value={particular.hsn} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                {/each}

                <span class="col-span-7"></span>
                <span>Sub Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={actionsObject.total}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Tax</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={actionsObject.tax}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={actionsObject.tax+actionsObject.total}/>
                </Label>
            </div>
        {:else}
            <div class="grid gap-2 col-span-3 grid-cols-7">
                <Label class="space-y-2 text-center col-span-2">
                    <span>Master</span>
                </Label>
                <Label class="space-y-2 text-center col-span-3">
                    <span>Description</span>
                </Label>
                <Label class="space-y-2 text-center col-span-1">
                    <span>Amount</span>
                </Label>
                {#each actionsObject.particulars.particulars as particular}
                    <Input required class="col-span-2 !m-0" bind:value={particular.master} />
                    <Input required class="col-span-3" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                {/each}

                <span class="col-span-6"></span>
                
                <span class="col-span-4"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={actionsObject.total}/>
                </Label>
            </div>
        {/if}

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