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
        Toggle,
        Popover
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import IdSelect from "../component/IdSelect.svelte";
    import SveltyPicker from '../component/svelty-picker';
    import { user } from '../global/stores.js'

    // Intialization

    let createModal, actionsModals, deleteModal, bulkUpdateModal;
    let selectedRows = new Set();

    let data, invoiceActionsModals, invoiceActionsObject={}, createdObject = {priority:1,status:0, money:[], time:[]}, bulkUpdateObject = {money:[], time:[]}, clients, actionsIndex, actionsObject = {money:[], time:[]}, userList, taskTemplates, services, companies, billTaskObject = {};
    let handler, rows, statusFilter = 1, billingFilter = 1, selfTasks = true, billModal = false;

    const task_status = [
        {name:'Pending',value:0},
        {name:'In Process',value:1},
        {name:'Waiting For Information',value:2},
        {name:'Pending For Review',value:3},
        {name:'Completed',value:4}
    ];

    const priority = [
        {name:'Low',value:0},
        {name:'Regular',value:1},
        {name:'Urgent',value:2}
    ];

    let error="";

    // fetch data

    (async ()=>{
        taskTemplates = await utils.get('/api/task_template/options');
        services = await utils.get('/api/service/options');
        companies = await utils.get('/api/company/options');
        clients = await utils.get('/api/client/options');
        userList = await utils.get('/api/employee/options');
        data = await utils.get('/api/task/'+statusFilter+'/'+billingFilter+'/'+selfTasks);

        clients = clients?.data || [];

        if(data.status != 'success'){
            error = data.message;
            data = null;
        }else{
            userList = [{name: "Unassigned", value: null}, ...userList];
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

    $: invoiceActionsObject.total = invoiceActionsObject?.particulars?.particulars.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);
    $: invoiceActionsObject.tax = invoiceActionsObject?.particulars?.particulars.reduce((a,b) => a+ (b.amount*b.gst*.01), 0);

    $: createdObject.total_time = createdObject?.time.map(e => e.time).reduce((a,b) =>{
        a = a.split(":");
        b = b.split(":");
        return `${parseInt(a[0]) + parseInt(b[0])}:${parseInt(a[1]) + parseInt(b[1])}`;
    }, "0:0");

    $: bulkUpdateObject.total_time = bulkUpdateObject?.time?.map(e => e.time).reduce((a,b) =>{
        a = a.split(":");
        b = b.split(":");
        return `${parseInt(a[0]) + parseInt(b[0])}:${parseInt(a[1]) + parseInt(b[1])}`;
    }, "0:0");

    $: actionsObject.total_time = actionsObject?.time.map(e => e.time).reduce((a,b) =>{
        a = a.split(":");
        b = b.split(":");
        return `${parseInt(a[0]) + parseInt(b[0])}:${parseInt(a[1]) + parseInt(b[1])}`;
    }, "0:0");

    $: actionsObject.total_money = actionsObject?.money.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);
    $: bulkUpdateObject.total_money = bulkUpdateObject?.money?.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);
    $: createdObject.total_money = createdObject?.money.map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);

    $: actionsObject.your_total_time = actionsObject?.time.filter(e => e.user == $user.id).map(e => e.time).reduce((a,b) => {
        a = a.split(":");
        b = b.split(":");
        return `${parseInt(a[0]) + parseInt(b[0])}:${parseInt(a[1]) + parseInt(b[1])}`;
    }, "0:0");

    $: actionsObject.your_total_money = actionsObject?.money.filter(e => e.user == $user.id).map(e => parseInt(e.amount)).reduce((a,b) => a+b, 0);

    //Functions

    async function openInvoiceActionsModal(id){

        if(!id){
            error = "Invoice not found";
            return;
        }

        invoiceActionsObject = await utils.get('/api/invoice/'+id);

        if(invoiceActionsObject.status != 'success'){
            error = invoiceActionsObject.message;
            return;
        }else if(!invoiceActionsObject.data){
            error = "Invoice not found";
            return;
        }

        invoiceActionsObject = invoiceActionsObject.data;
        
        invoiceActionsModals = true;
    }

    function removeParticularActions(index){
        invoiceActionsObject.particulars.particulars.splice(index,1);
        invoiceActionsObject.particulars.particulars = invoiceActionsObject.particulars.particulars;
    }

    function addParticularInActions(isGST){
        if(isGST){
            invoiceActionsObject.particulars.particulars.push({
                master:'',
                description:'',
                gst:0,
                hsn:'',
                amount:0
            });
        }else{
            invoiceActionsObject.particulars.particulars.push({
                master:'',
                description:'',
                amount:0
            });
        }

        invoiceActionsObject.particulars.particulars = invoiceActionsObject.particulars.particulars;
    }

    async function invoiceUpdateData(){

        invoiceActionsObject.company = companies.find(e => e.value == invoiceActionsObject.company_id);

        const resp = await utils.put_json('/api/invoice/',invoiceActionsObject);

        if(resp.status == 'success'){
            invoiceActionsModals = false;

            invoiceActionsObject = {};
        }else{
            error = resp.message || "";
        }

    }

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

    async function loadTaskTemplate(e){
        const template_id = e.target.value;
        const template = await utils.get('/api/task_template/'+template_id);

        if(template.status == 'success'){
            delete template.data.name;
            delete template.data.id;

            createdObject = template.data;
            createdObject = {
                ...createdObject,
                time:[],
                money:[]
            }
        }else{
            error = template.message || "";
        }

    }

    function removeCreatedTime(idx) {
        createdObject.time.splice(idx,1);
        createdObject.time = createdObject.time;
    }

    function addCreatedTime() {
        createdObject.time.push({
            user: $user.id,
            time: "0:0"
        });
        createdObject.time = createdObject.time;
    }

    function removeBulkTime(idx) {
        bulkUpdateObject.time.splice(idx,1);
        bulkUpdateObject.time = bulkUpdateObject.time;
    }

    function addBulkTime() {
        bulkUpdateObject.time.push({
            user: $user.id,
            time: "0:0"
        });
        bulkUpdateObject.time = bulkUpdateObject.time;
    }

    function removeActionTime(idx) {
        actionsObject.time.splice(idx,1);
        actionsObject.time = actionsObject.time;
    }

    function addActionTime() {
        actionsObject.time.push({
            user: $user.id,
            time: "0:0"
        });
        actionsObject.time = actionsObject.time;
    }

    function removeCreatedMoney(idx) {
        createdObject.money.splice(idx,1);
        createdObject.money = createdObject.money;
    }

    function addCreatedMoney() {
        createdObject.money.push({
            user: $user.id,
            amount: 0
        });
        createdObject.money = createdObject.money;
    }

    function removeBulkMoney(idx) {
        bulkUpdateObject.money.splice(idx,1);
        bulkUpdateObject.money = bulkUpdateObject.money;
    }

    function addBulkMoney() {
        bulkUpdateObject.money.push({
            user: $user.id,
            amount: 0
        });
        bulkUpdateObject.money = bulkUpdateObject.money;
    }

    function removeActionMoney(idx) {
        actionsObject.money.splice(idx,1);
        actionsObject.money = actionsObject.money;
    }

    function addActionMoney() {
        actionsObject.money.push({
            user: $user.id,
            amount: 0
        });
        actionsObject.money = actionsObject.money;
    }

    async function changeFilter(e){

        /**
         * 0 - Not Billed / Completed
         * 1 - All
         * 2 - Billed / Completed
        */

        const caller = e.target.id;

        if(caller == 'status'){
            statusFilter = (statusFilter + 1) % 3;
        }else if(caller == 'bill'){
            billingFilter = (billingFilter + 1) % 3;
        }else if(caller == 'owner'){
            selfTasks = !selfTasks;
        }

        const resp = await utils.get('/api/task/'+statusFilter+'/'+billingFilter+'/'+selfTasks);

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

        actionsObject = await utils.get('/api/task/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
        }else{
            actionsObject = actionsObject.data;
            actionsModals = true;
        }
    }

    async function updateData(){
        const resp = await utils.put_json('/api/task/',actionsObject);

        if(resp.status == 'success'){
            if((resp.data.status == 4 && statusFilter == 0) || (resp.data.status != 4 && statusFilter == 2)){
                data.splice(actionsIndex, 1);
            }else{
                resp.data.assigned_user = userList.find(e => e.value == resp.data.assigned_to);
                resp.data.assigned_user.username = resp.data.assigned_user.name;

                resp.data.client = clients.find(e => e.value == resp.data.client_id);

                resp.data.client.group = clients.find(e => e.value == resp.data.client_id);

                resp.data.service = services.find(e => e.value == resp.data.service_id);

                resp.data._selected = data[actionsIndex]._selected;

                data[actionsIndex] = resp.data;
            }

            handler.setRows(data);
            actionsModals = false;
        }else{
            error = resp.message || "";
        }
    }

    async function deleteSelected(){
        const resp = await utils._delete('/api/task/destroy/',{id:Array.from(selectedRows)});

        if(resp.status == 'success'){
            for (let i = 0; i < data.length; i++) {
                if (selectedRows.has(parseInt(data[i].id))) {
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

    async function billSelected(){
        billTaskObject.ids = Array.from(selectedRows);

        const resp = await utils.put_json('/api/task/bill/',billTaskObject);

        if(resp.status = 'success'){
            for (let i = 0; i < data.length; i++) {
                if(billingFilter == 0){
                    data.splice(i,1);
                    i--;
                }else if (selectedRows.has(parseInt(data[i].id))) {
                    data[i]._selected = false;
                }
            }

            selectedRows.clear();
            handler.setRows(data);
            selectedRows = selectedRows;
            billModal = false;
            billTaskObject = {};
        }else{
            error = resp.message || "";
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
        link.download = 'Tasks.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

    async function createData(){
        const resp = await utils.post_json('/api/task/',createdObject);

        if(resp.status == 'success'){
            resp.data._selected = false;

            resp.data.assigned_user = userList.find(e => e.value == resp.data.assigned_to);
            if(resp.data.assigned_user){
                resp.data.assigned_user.username = resp.data.assigned_user.name;
            }

            resp.data.client = clients.find(e => e.value == resp.data.client_id);

            resp.data.client.group = clients.find(e => e.value == resp.data.client_id);

            resp.data.service = services.find(e => e.value == resp.data.service_id);

            if(!(resp.data.status == 4 && statusFilter == 0) && !(resp.data.status != 4 && statusFilter == 2)){
                data.push(resp.data);
            }

            handler.setRows(data);
            createModal = false;
            createdObject = {priority:1,status:0, time:[], money:[]}
        }else{
            error = resp.message || "";
        }
    }

    async function bulkUpdateData(){
        bulkUpdateObject.ids = Array.from(selectedRows);

        const resp = await utils.put_json('/api/task/bulk/',bulkUpdateObject);

        if(resp.status == 'success'){
            data = await utils.get('/api/task/'+statusFilter+'/'+billingFilter+'/'+selfTasks);

            if(data.status != 'success'){
                error = data.message;
                data = null;
            }else{
                data = data.data;

                data.forEach((v) => {
                    v["_selected"] = false;
                });

                handler.setRows(data);
                selectedRows = new Set();
            }

            bulkUpdateModal = false;
            bulkUpdateObject = {money:[], time:[]};
        }else{
            error = resp.message || "";
        }
    }

</script>
{#if data  && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">
            <Button gradient color="blue" on:click={()=> createModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>                        
                &nbsp;
                Create
            </Button>

            <Button gradient color="green" id="status" on:click={changeFilter}>
                <svg xmlns="http://www.w3.org/2000/svg" id="status" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
                </svg>                                                   
                &nbsp;
                {#if statusFilter == 1}
                    All
                {:else if statusFilter == 2}
                    Completed
                {:else}
                    Pending
                {/if}
            </Button>

            <Button gradient color="green" id="bill" on:click={changeFilter}>
                <svg xmlns="http://www.w3.org/2000/svg" id="bill" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>                                                             
                &nbsp;
                {#if billingFilter == 1}
                    All
                {:else if billingFilter == 2}
                    Billed
                {:else}
                    Not Billed
                {/if}
            </Button>

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

            <Button disabled={buttonDisabled} gradient color="green" on:click={()=> bulkUpdateModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                </svg>                  
                &nbsp;
                Bulk Update
            </Button>

            <Button id="billTaskBtn" disabled={buttonDisabled || billingFilter!=0} gradient color="blue" on:click={()=> billModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                &nbsp;
                Bill Tasks
            </Button>

            {#if (billingFilter!=0)}
                <Popover class="w-64 text-sm font-light " triggeredBy="#billTaskBtn">
                    Toggle to Not Billed
                </Popover>
            {/if}

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
                            <Th {handler} orderBy={row => row.id || "-"}>id</Th>
                            <Th {handler} orderBy={row => row.title || "-"}>Title</Th>
                            <Th {handler} orderBy={row => row.client?.name || "-"}>Client</Th>
                            <Th {handler} orderBy={row => row.client?.group?.name || "-"}>Group</Th>
                            <Th {handler} orderBy={(row => row.service.name || "-")}>Service</Th>
                            <Th {handler} orderBy={(row => row.assigned_user?.name || "Unassigned")}>Assigned To</Th>
                            <Th {handler} orderBy={(row => task_status[row.status].name || "-")}>Status</Th>
                            <Th {handler} orderBy={(row => row.due_date || "-")}>Due Date</Th>
                            <Th {handler} orderBy={(row => priority[row.priority].name || "-")}>Priority</Th>
                            <Th {handler} orderBy={row => row.created || "-"}>Created At</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.title || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client?.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client?.group?.name || "-"}/>
                            <ThSearch {handler} filterBy={(row => row.service.name || "-")}/>
                            <ThSearch {handler} filterBy={(row => row.assigned_user?.name || "Unassigned")}/>
                            <ThSearch {handler} filterBy={(row => task_status[row.status].name || "-")}/>
                            <ThSearch {handler} filterBy={(row => row.due_date || "-")}/>
                            <ThSearch {handler} filterBy={(row => priority[row.priority].name || "-")}/>
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
                                    {(row.title || "-").substring(0,20)}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.client?.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.client?.group?.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.service?.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.assigned_user?.username || "Unassigned"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {task_status[row.status].name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.due_date || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {priority[row.priority].name || "-"}
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

<Modal bind:open={deleteModal} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete selected rows?</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={billModal} size="xs" >
    <div class="text-center">
        <form on:submit|preventDefault={billSelected}>
            <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to bill selected rows?</h3>
            
            <Label class="space-y-2 mb-5 text-left grid grid-cols-4 gap-x-3 items-center">
                <span class="text-start">Company</span>
                <Select class="col-span-3 !m-0" required items={companies} bind:value={billTaskObject.company_id}/>
            </Label>
            <Label class="space-y-2 mb-5 text-left grid grid-cols-4 gap-x-3 items-center">
                <span class="text-start">GST</span>
                <Toggle class="col-span-3 !m-0 mb-5" bind:checked={billTaskObject.gst}></Toggle>
            </Label>

            <Button color="green" type="submit" class="mr-2">Yes, I'm sure</Button>
            <Button color='alternative' on:click={() => billModal=false}>No, cancel</Button>
        </form>
    </div>
</Modal>

<Modal bind:open={bulkUpdateModal} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={bulkUpdateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">
            Update Tasks
            <small class="text-sm font-light">(Leave empty for unchanged)</small>
        </h3>
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-start">Template</span>
                <Select class="col-span-8 !m-0" items={taskTemplates} value={0} on:change={loadTaskTemplate}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-start">Title</span>
                <Input class="col-span-8 !m-0" type="text" placeholder="Title" bind:value={bulkUpdateObject.title}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Service</span>
                <Select items={services} bind:value={bulkUpdateObject.service_id} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Client</span>
                <IdSelect items={clients} bind:value={bulkUpdateObject.client_id}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Assigned To</span>
                <Select items={userList} bind:value={bulkUpdateObject.assigned_to} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Status</span>
                <Select items={task_status} bind:value={bulkUpdateObject.status}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Priority</span>
                <Select items={priority} bind:value={bulkUpdateObject.priority}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-start">Billed</span>
                <Toggle bind:value={bulkUpdateObject.billed} bind:checked={bulkUpdateObject.billed}></Toggle>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="flex text-end">Billed Invoice
                    <a class="text-end" on:click={() => openInvoiceActionsModal(bulkUpdateObject.invoice_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ms-1 w-4 h-4 text-blue-500 cursor-pointer text-end">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </span>
                <Input bind:value={bulkUpdateObject.invoice_id}></Input>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-start">Description</span>
                <Textarea class="col-span-8 !m-0" placeholder="Description" rows="4" bind:value={bulkUpdateObject.description}/>
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
                <span>Time (Hrs)</span>
            </Label>

            {#each bulkUpdateObject.time as particular,index}
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />

                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <SveltyPicker disabled={!can_edit} format="hh:ii" bind:value={particular.time} />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeBulkTime(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addBulkTime()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={bulkUpdateObject.total_time}/>
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

            {#each bulkUpdateObject.money as particular,index}
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />
                
                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <Input disabled={!can_edit} required bind:value={particular.amount} type="number" />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeBulkMoney(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addBulkMoney()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={bulkUpdateObject.total_money}/>
            </Label>
        </div>

        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Update</Button>
            <Button on:click={()=>{bulkUpdateModal=false;bulkUpdateObject={money:[], time:[]}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Create Task</h3>
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Template</span>
                <Select class="col-span-8 !m-0" items={taskTemplates} value={0} on:change={loadTaskTemplate}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Title</span>
                <Input class="col-span-8 !m-0" required type="text" placeholder="Title" bind:value={createdObject.title}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Service</span>
                <Select class="col-span-2 !m-0" required items={services} bind:value={createdObject.service_id} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Client</span>
                <IdSelect class="col-span-2 !m-0" required items={clients} bind:value={createdObject.client_id}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Assigned To</span>
                <Select class="col-span-2 !m-0" items={userList} bind:value={createdObject.assigned_to} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Status</span>
                <Select class="col-span-2 !m-0" required items={task_status} bind:value={createdObject.status}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Due Date</span>
                <SveltyPicker bind:value={createdObject.due_date} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Priority</span>
                <Select class="col-span-2 !m-0" required items={priority} bind:value={createdObject.priority}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Billed</span>
                <Toggle class="col-span-2 !m-0" bind:value={createdObject.billed} bind:checked={createdObject.billed}></Toggle>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="flex text-end">Billed Invoice
                    <a on:click={() => openInvoiceActionsModal(createdObject.invoice_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ms-1 w-4 h-4 text-blue-500 cursor-pointer text-end">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>                      
                    </a>
                </span>
                <Input bind:value={createdObject.invoice_id}></Input>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span>Description</span>
                <Textarea class="col-span-8 !m-0" placeholder="Description" rows="4" bind:value={createdObject.description}/>
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
                <span>Time (Hrs)</span>
            </Label>

            {#each createdObject.time as particular,index}
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />

                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <SveltyPicker disabled={!can_edit} format="hh:ii" bind:value={particular.time} />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeCreatedTime(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addCreatedTime()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input class="col-span-2 !m-0" readonly value={createdObject.total_time}/>
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

            {#each createdObject.money as particular,index}
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />
                
                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <Input disabled={!can_edit} required bind:value={particular.amount} type="number" />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeCreatedMoney(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addCreatedMoney()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={createdObject.total_money}/>
            </Label>
        </div>

        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject={priority:1,status:0,time:[], money:[]}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">View/Update Task</h3>
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Title</span>
                <Input class="col-span-8 !m-0" type="text" placeholder="Title" bind:value={actionsObject.title}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Service</span>
                <Select class="col-span-2 !m-0" items={services} bind:value={actionsObject.service_id} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Client</span>
                <IdSelect class="col-span-2 !m-0" items={clients} required bind:value={actionsObject.client_id}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Assigned To</span>
                <Select class="col-span-2 !m-0" items={userList} bind:value={actionsObject.assigned_to} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Status</span>
                <Select class="col-span-2 !m-0" required items={task_status} bind:value={actionsObject.status}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Due Date</span>
                <SveltyPicker bind:value={actionsObject.due_date} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Priority</span>
                <Select class="col-span-2 !m-0" required items={priority} bind:value={actionsObject.priority}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Billed</span>
                <Toggle class="col-span-2 !m-0" bind:value={actionsObject.billed} bind:checked={actionsObject.billed}></Toggle>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="flex text-end">Billed Invoice
                    <a class="text-end" on:click={() => openInvoiceActionsModal(actionsObject.invoice_id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ms-1 w-4 h-4 text-blue-500 cursor-pointer text-end">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>                      
                    </a>
                </span>
                <Input class="col-span-2 !m-0" bind:value={actionsObject.invoice_id}></Input>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Description</span>
                <Textarea class="col-span-8 !m-0" placeholder="Description" rows="4" bind:value={actionsObject.description}/>
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
                <span>Time (Hrs)</span>
            </Label>

            {#each actionsObject.time as particular,index}
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />

                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <SveltyPicker disabled={!can_edit} format="hh:ii" bind:value={particular.time} />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeActionTime(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addActionTime()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Your Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={actionsObject.your_total_time}/>
            </Label>

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
                {@const can_edit = $user.is_admin || particular.user == $user.id}

                <Select disabled={!$user.is_admin} items={userList} class="col-span-2 !m-0" bind:value={particular.user} />
                
                <Input disabled={!can_edit} required class="col-span-3" bind:value={particular.description} />
                <Input disabled={!can_edit} required bind:value={particular.amount} type="number" />
                
                {#if can_edit}
                    <Button color="red" on:click={()=>removeActionMoney(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/if}
            {/each}

            <span class="col-span-6"></span>
            <Button on:click={()=>addActionMoney()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Button>
            
            <span class="col-span-4"></span>
            <span>Your Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={actionsObject.your_total_money}/>
            </Label>

            <span class="col-span-4"></span>
            <span>Total</span>
            <Label class="space-y-2 text-center font-bold">
                <Input readonly value={actionsObject.total_money}/>
            </Label>
        </div>

        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button  type="submit" class="w-full">Update</Button>
            <Button on:click={()=>actionsModals=false} color="alternative" class="w-full">Close</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={invoiceActionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={invoiceUpdateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-1">View/Update Entry</h3>
        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Invoice ID</span>
            <Input value={invoiceActionsObject.id} readonly/>
        </Label>
        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Client</span>
            <IdSelect items={clients} required bind:value={invoiceActionsObject.client_id}/>
        </Label>

        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Company</span>
            <IdSelect items={companies} required bind:value={invoiceActionsObject.company_id}/>
        </Label>

        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Date</span>
            <SveltyPicker format="d M yyyy" required bind:value={invoiceActionsObject.date}/>
        </Label>

        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Paid</span>
            <Toggle bind:value={invoiceActionsObject.paid} bind:checked={invoiceActionsObject.paid}></Toggle>
        </Label>

        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">GST</span>
            <Toggle bind:value={invoiceActionsObject.gst} bind:checked={invoiceActionsObject.gst}></Toggle>
        </Label>
        
        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Remarks</span>
            <Textarea bind:value={invoiceActionsObject.remarks}/>
        </Label>

        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
            <span class="text-end">Note for self</span>
            <Textarea bind:value={invoiceActionsObject.note}/>
        </Label>

        {#if invoiceActionsObject.gst}
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
                {#each invoiceActionsObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2 !m-0" bind:value={particular.master} />
                    <Input required class="col-span-4" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.gst} />
                    <Input required class="col-span-1" bind:value={particular.hsn} />
                    <Input required class="col-span-1" bind:value={particular.amount} type="number" />
                    <Button color="red" on:click={()=>removeParticularActions(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}

                <span class="col-span-9"></span>
                <Button on:click={()=>addParticularInActions(invoiceActionsObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>

                <span class="col-span-7"></span>
                <span>Sub Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={invoiceActionsObject.total}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Tax</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={invoiceActionsObject.tax}/>
                </Label>

                <span class="col-span-7"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={invoiceActionsObject.tax+invoiceActionsObject.total}/>
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
                {#each invoiceActionsObject.particulars.particulars as particular,index}
                    <Input required class="col-span-2 !m-0" bind:value={particular.master} />
                    <Input required class="col-span-3" bind:value={particular.description} />
                    <Input required class="col-span-1" bind:value={particular.amount} type="number" />
                    <Button color="red" on:click={()=>removeParticularActions(index)} class="col-span-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </Button>
                {/each}

                <span class="col-span-6"></span>
                <Button on:click={()=>addParticularInActions(invoiceActionsObject.gst)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>
                
                <span class="col-span-4"></span>
                <span>Total</span>
                <Label class="space-y-2 text-center font-bold">
                    <Input readonly value={invoiceActionsObject.total}/>
                </Label>
            </div>
        {/if}

        <div class="col-span-2 grid gap-6 grid-cols-3">
            <Button type="submit" class="w-full">Update</Button>
            {#if invoiceActionsObject?.id}
                <Button type="button" href={"/api/invoice?ids="+invoiceActionsObject.id} target="_blank" class="w-full">Download</Button>
            {/if}
            <Button on:click={()=>invoiceActionsModals=false} color="alternative" class="w-full">Close</Button>
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