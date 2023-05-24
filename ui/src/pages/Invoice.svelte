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
        Select,
    } from "flowbite-svelte";

    import { DataHandler } from "@vincjo/datatables";
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import IdSelect from "../component/IdSelect.svelte";
    import SveltyPicker from '../component/svelty-picker';

    // Intialization
    const receivers = [
        {name: "Individual", value: "Individual"},
        {name: "Parent Company", value: "Parent Company"},
        {name: "Both", value: "Both"},
    ];

    let createModal, actionsModals, deleteModal, sendMailModal, filterStatus=3, send_to;
    let selectedRows = new Set();

    let data, emptyCreatedObject, createdObject={}, actionsIndex, actionsObject = {}, client_list, company_list;
    let handler, rows;
    let error="", success="";

    // fetch data

    (async ()=>{
        client_list = await utils.get('/api/client/options/');
        company_list = await utils.get('/api/company/options/');
        data = await utils.get('/api/invoice/filter/'+filterStatus);

        emptyCreatedObject = {
            particulars:{
                particulars:[]
            }
        };

        createdObject = JSON.parse(JSON.stringify(emptyCreatedObject));
        
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
    $: createdObject.total = createdObject?.particulars?.particulars.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);

    $: actionsObject.tax = actionsObject?.particulars?.particulars.reduce((a,b) => a+ (b.amount*b.gst*.01), 0);
    $: createdObject.tax = createdObject?.particulars?.particulars.reduce((a,b) => a+ (b.amount*b.gst*.01), 0);

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

        actionsObject = await utils.get('/api/invoice/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
            return;
        }

        actionsObject = actionsObject.data;
        
        actionsModals = true;
    }

    async function changeFilter(){
        filterStatus = (filterStatus+1)%4;

        const resp = await utils.get('/api/invoice/filter/'+filterStatus);

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

    function removeParticularActions(index){
        actionsObject.particulars.particulars.splice(index,1);
        actionsObject.particulars.particulars = actionsObject.particulars.particulars;
    }

    function removeParticularCreated(index){
        createdObject.particulars.particulars.splice(index,1);
        createdObject.particulars.particulars = createdObject.particulars.particulars;
    }

    function addParticularInActions(isGST){
        if(isGST){
            actionsObject.particulars.particulars.push({
                master:'',
                description:'',
                gst:0,
                hsn:'',
                amount:0
            });
        }else{
            actionsObject.particulars.particulars.push({
                master:'',
                description:'',
                amount:0
            });
        }

        actionsObject.particulars.particulars = actionsObject.particulars.particulars;
    }

    function addParticularInCreated(isGST){
        if(isGST){
            createdObject.particulars.particulars.push({
                master:'',
                description:'',
                gst:0,
                hsn:'',
                amount:0
            });
        }else{
            createdObject.particulars.particulars.push({
                master:'',
                description:'',
                amount:0
            });
        }

        createdObject.particulars.particulars = createdObject.particulars.particulars;
    }

    async function updateData(){

        actionsObject.company = company_list.find(e => e.value == actionsObject.company_id);

        const resp = await utils.put_json('/api/invoice/',actionsObject);

        if(resp.status == 'success'){
            resp.data._selected = data[actionsIndex]._selected;

            resp.data.client.group = client_list.find(e => e.value == resp.data.client.group_id);
            resp.data.company = company_list.find(e => e.value == resp.data.company_id);

            data[actionsIndex] = resp.data;
            handler.setRows(data);
            actionsModals = false;

            actionsObject = {};
        }else{
            error = resp.message || "";
        }
        
    }

    async function deleteSelected(){
        const resp = await utils._delete('/api/invoice/destroy/',{id:Array.from(selectedRows)});

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

    function escapeCSV(original_row){
        let row = JSON.parse(JSON.stringify(original_row));
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
        link.download = 'Invoices.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

    async function sendMail(){
        const resp = await utils.post_json('/api/invoice/send_mail/',{ids:Array.from(selectedRows), send_to: send_to});

        if(resp.status == 'success'){
            selectedRows.clear();
            selectedRows = selectedRows;
            success = "Mail sent successfully";
        }else{
            error = resp.message;
        }
    }

    async function downloadBill(){
        window.open('/api/invoice?ids='+Array.from(selectedRows), "_blank");
    }

    async function createData(){
        let resp = await utils.post_json('/api/invoice/',createdObject);

        if(resp.status == 'success'){
            resp.data._selected = false;

            resp.data.client.group = client_list.find(e => e.value == resp.data.client.group_id);
            resp.data.company = company_list.find(e => e.value == resp.data.company_id);

            data.push(resp.data);
            handler.setRows(data);
            createModal = false;

            createdObject = JSON.parse(JSON.stringify(emptyCreatedObject))
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

            <Button gradient color="green" on:click={changeFilter}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                &nbsp;
                {#if filterStatus == 0}
                    Waiting
                {:else if filterStatus == 1}
                    Unpaid
                {:else if filterStatus == 2}
                    Paid
                {:else}
                    All
                {/if}
            </Button>

            <Button disabled={buttonDisabled} gradient color="green" on:click={() => sendMailModal = true}>
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
                            <Th {handler} orderBy="id">ID</Th>
                            <Th {handler} orderBy={row => row.client?.name}>Client</Th>
                            <Th {handler} orderBy={row => row.client?.group?.name}>Group</Th>
                            <Th {handler} orderBy="total">Total</Th>
                            <Th {handler} orderBy="tax">Tax</Th>
                            <Th {handler} orderBy="paid">Paid</Th>
                            <Th {handler} orderBy="gst">GST</Th>
                            <Th {handler} orderBy={row => row.company?.name}>Company</Th>
                            <Th {handler} orderBy="date">Date</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client?.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client?.group?.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.total + (row.tax || 0) || "-"}/>
                            <ThSearch {handler} filterBy={row => row.tax || "-"}/>
                            <ThSearch {handler} filterBy={row => row.paid ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.gst ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.company?.name || "-"}/>
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
                                    {row.client?.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.client?.group?.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.total + (row.tax || 0) || "-"}
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
                                    {row.company?.name || "-"}
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

<Modal bind:open={deleteModal} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500">Are you sure you want to delete selected rows?</h3>
        <h3 class="mb-5 text-sm font-normal text-gray-500">Users with this role will be assigned default viewer role</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={sendMailModal} size="xs" autoclose>
    <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>          
        <h3 class="mb-1 text-lg font-normal text-gray-500">Select whom to send these mails</h3>
        <h3 class="mb-5 text-sm font-normal text-red-500">Please make sure that email and smtp are configured</h3>
        <Select class="mb-5" required items={receivers} bind:value={send_to}></Select>
        <Button color="green" on:click={sendMail} class="mr-2">Send</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 col-span-1">Create Invoice</h3>
        <Label class="space-y-2">
            <span>Client</span>
            <IdSelect items={client_list} required bind:value={createdObject.client_id}/>
        </Label>

        <Label class="space-y-2">
            <span>Company</span>
            <IdSelect items={company_list} required bind:value={createdObject.company_id}/>
        </Label>

        <Label class="space-y-2">
            <span>Date</span>
            <SveltyPicker format="M d, yyyy" required bind:value={createdObject.date}/>
        </Label>

        <Label class="space-y-2">
            <span>&nbsp;</span>
            <Toggle bind:value={createdObject.paid} bind:checked={createdObject.paid}>Paid</Toggle>
        </Label>

        <Label class="space-y-2">
            <span>&nbsp;</span>
            <Toggle bind:value={createdObject.gst} bind:checked={createdObject.gst}>GST</Toggle>
        </Label>
        
        <Label class="space-y-2">
            <span>Remarks</span>
            <Textarea bind:value={createdObject.remarks}/>
        </Label>

        <Label class="space-y-2">
            <span>Note</span>
            <Textarea bind:value={createdObject.note}/>
        </Label>

        {#if createdObject.gst}
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
                {#each createdObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2" bind:value={particular.master} />
                    <Input required class="col-span-4" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.gst} />
                    <Input required class="col-span-1" bind:value={particular.hsn} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                    <Button color="red" on:click={()=>removeParticularCreated(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}
                <span class="col-span-9"></span>
                <Button on:click={()=>addParticularInCreated(createdObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>

                <span class="col-span-7"></span>
                <span>Sub Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={createdObject.total}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Tax</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={createdObject.tax}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={createdObject.tax+createdObject.total}/>
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
                {#each createdObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2" bind:value={particular.master} />
                    <Input required class="col-span-3" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                    <Button color="red" on:click={()=>removeParticularCreated(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}

                <span class="col-span-6"></span>
                <Button on:click={()=>addParticularInCreated(createdObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>

                <span class="col-span-4"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={createdObject.total}/>
                </Label>
            </div>
        {/if}

        <div class="col-span-1 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject=emptyCreatedObject}} color="alternative" class="w-full">Close</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-1">View/Update Entry</h3>
        <Label class="space-y-2">
            <span>Invoice ID</span>
            <Input value={actionsObject.id} readonly/>
        </Label>
        <Label class="space-y-2">
            <span>Client</span>
            <IdSelect items={client_list} required bind:value={actionsObject.client_id}/>
        </Label>

        <Label class="space-y-2">
            <span>Company</span>
            <IdSelect items={company_list} required bind:value={actionsObject.company_id}/>
        </Label>

        <Label class="space-y-2">
            <span>Date</span>
            <SveltyPicker format="M d, yyyy" required bind:value={actionsObject.date}/>
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
            <span>Note</span>
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
                {#each actionsObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2" bind:value={particular.master} />
                    <Input required class="col-span-4" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.gst} />
                    <Input required class="col-span-1" bind:value={particular.hsn} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                    <Button color="red" on:click={()=>removeParticularActions(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}

                <span class="col-span-9"></span>
                <Button on:click={()=>addParticularInActions(actionsObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>

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
                {#each actionsObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2" bind:value={particular.master} />
                    <Input required class="col-span-3" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.amount} />
                    <Button color="red" on:click={()=>removeParticularActions(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}

                <span class="col-span-6"></span>
                <Button on:click={()=>addParticularInActions(actionsObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>
                
                <span class="col-span-4"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={actionsObject.total}/>
                </Label>
            </div>
        {/if}

        <div class="col-span-2 grid gap-6 grid-cols-3">
            <Button type="submit" class="w-full">Update</Button>
            {#if actionsObject?.id}
                <Button type="button" href={"/api/invoice?ids="+actionsObject.id} target="_blank" class="w-full">Download</Button>
            {/if}
            <Button on:click={()=>actionsModals=false} color="alternative" class="w-full">Close</Button>
        </div>
    </form>
</Modal>

<!--Alerts-->

{#if error?.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}

{#if success?.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="green" dismissable on:close={()=>success=""}>
            <span slot="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
            </span>
            <span class="font-medium">success!</span> {success}
        </Alert>
    </div>
{/if}