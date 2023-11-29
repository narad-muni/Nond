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
        Alert,
        Textarea,
        Select,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import IdSelect from "../component/IdSelect.svelte";
    import SveltyPicker from '../component/svelty-picker';

    // Intialization

    let createModal, createTasksModal, actionsModals, deleteModal, bulkServiceModal, allColumns = false;
    let selectedRows = new Set();

    let headers, services, all_services, client_list, data, createdObject={services:{}}, createTasksObject={priority:1,status:0}, taskTemplates, actionsIndex, actionsObject, setServiceObject={};
    let emptyCreatedObject;
    let bulkServiceData, removeOldServices;
    let handler, rows;
    const frequency = [
        {name: "Daily", value:"1 day"},
        {name: "Weekly", value:"1 week"},
        {name: "Bi Weekly", value:"2 weeks"},
        {name: "Monthly", value:"1 month"},
        {name: "Quarterly", value:"3 months"},
        {name: "Half Yearly", value:"6 months"},
        {name: "Yearly", value:"1 year"},
        {name: "One Time", value: null}
    ];

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

    let error="", users=[{name: "Unassigned", value:null}];

    // fetch data

    (async ()=>{
        client_list = await utils.get('/api/client/options');
        headers = await utils.get('/api/master_template/options/clients');
        users = users.concat(await utils.get('/api/employee/options'));
        taskTemplates = await utils.get('/api/task_template/options');
        services = await utils.get('/api/service/options/false');
        all_services = await utils.get('/api/service/options/true');
        data = await utils.get('/api/client/master/false');

        client_list = client_list?.data || [];

        if(data.status != 'success'){
            error = data.message;
            data = null;
        }else{
            client_list = [{name:"Self",value:null},...client_list];

            headers.data.forEach((column,i) => {
                if(column.column_type == 'Dropdown'){
                    headers.data[i].column_info.options = headers.data[i].column_info.options.map(i => {return {value:i, name:i}});
                    headers.data[i].column_info.options = [{name: "-", value: null}, ...headers.data[i].column_info.options];
                }
            });

            headers.data.sort((a,b) => a.order > b.order ? 1 : -1);

            data = data.data;
            data.forEach((v) => {
                v["_selected"] = false;
            });

            //set services in created object
            services.forEach(service => {
                createdObject.services[service.value] = {service_id:service.value}
            });
            
            emptyCreatedObject = structuredClone(createdObject);

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
        let oid = e.target.getAttribute('oid');
        actionsIndex = data.findIndex(e => e.id == oid);

        actionsObject = await utils.get('/api/client/'+oid);

        if(actionsObject.status == 'success'){
            actionsObject = actionsObject.data;

            const tempService = {}

            //set values in temp service object from services in received modal
            actionsObject.services.forEach(service => {
                tempService[service.service_id] = service;
            });

            actionsObject.services = tempService;

            services.forEach(service => {
                if(!actionsObject.services[service.value]){
                    actionsObject.services[service.value] = {service_id:service.value}
                }else{
                    actionsObject.services[service.value].subscribed = true;
                }
            });

            actionsModals = true;
        }else{
            error = actionsObject.message || "";
        }
    }

    function openBulkSetService(){
        bulkServiceData = {};
        removeOldServices = false;

        //set services in created object
        services.forEach(service => {
            bulkServiceData[service.value] = {service_id:service.value}
        });

        bulkServiceModal = true;
    }

    async function bulkSetService(){

        const data = {
            schedulers: bulkServiceData,
            client_ids: Array.from(selectedRows),
            remove_old: removeOldServices,
        }
        
        const resp = await utils.put_json('/api/client/bulk_service_update/',data);

        if(resp.status == 'success'){
            bulkServiceModal = false;
            setServiceObject = {};
        }else{
            error = resp.message || "";
        }
    }

    async function updateData(){
        actionsObject._services  = JSON.stringify(actionsObject.services);
        const resp = await utils.put_form('/api/client/',utils.getFormData(actionsObject));
        
        if(resp.status == 'success'){
            client_list = await utils.get('/api/client/options');
            client_list = client_list?.data || [];
            client_list = [{name:"Self",value:null},...client_list];
            
            resp.data._selected = data[actionsIndex]._selected;

            resp.data.group = client_list.find(e => e.value == resp.data.group_id);

            data[actionsIndex] = resp.data;
            handler.setRows(data);

            actionsModals = false;
        }else{
            error = resp.message || "";
        }
    }

    async function reloadData(){
        if(allColumns){
            data = await utils.get('/api/client/false');
        }else{
            data = await utils.get('/api/client/master/false');
        }

        data = data.data;

        selectedRows.clear();
        selectedRows = selectedRows;
        handler.setRows(data);
    }

    async function createTasks(){
        const client_id = Array.from(selectedRows);
        createTasksObject.client_id = client_id;

        const resp = await utils.post_json('/api/task/',createTasksObject);

        if(resp.status == 'success'){

            //clear selection
            for (let i = 0; i < data.length; i++) {
                if (selectedRows.has(data[i].id)) {
                    data[i]._selected = false;
                }
            }

            selectedRows.clear();
            handler.setRows(data);

            //reset object and modal            
            createTasksObject = {priority:1,status:0};
            createTasksModal = false;
        }else{
            error = resp.message || "";
        }
    }

    async function loadTaskTemplate(e){
        const template_id = e.target.value;
        const template = await utils.get('/api/task_template/'+template_id);

        if(template.status == 'success'){
            delete template.data.name;
            delete template.data.id;

            createTasksObject = template.data;
        }else{
            error = template.message || "";
        }

    }

    async function viewAllColumns(){
        allColumns = !allColumns;

        if(allColumns){
            data = await utils.get('/api/client/master/false');
        }else{
            data = await utils.get('/api/client/false');
        }
        

        data = data.data;

        data.forEach((v) => {
            if(selectedRows.has(v["id"])){
                v["_selected"] = true;
            }else{
                v["_selected"] = false;
            }
        });

        handler.setRows(data);
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
        link.download = 'Clients.csv';
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

    async function deleteSelected(){
        for (let i = 0; i < data.length; i++) {
            if (selectedRows.has(data[i].id)) {
                data.splice(i, 1);
                i--;
            }
        }

        await utils._delete('/api/client/',{id: Array.from(selectedRows)});

        selectedRows.clear();
        handler.setRows(data);
        selectedRows = selectedRows;
    }

    async function createData(){
        createdObject._services  = JSON.stringify(createdObject.services);
        const resp = await utils.post_form('/api/client',utils.getFormData(createdObject));

        if(resp.status == 'success'){
            resp.data._selected = false;
            
            client_list.push({name:resp.data.name,value:resp.data.id});
            
            resp.data.group = client_list.find(e => e.value == resp.data.group_id);

            data.push(resp.data);
            handler.setRows(data);
            createModal = false;
            createdObject = structuredClone(emptyCreatedObject);
            
        }else{
            error = resp.message || "";
        }
    }

</script>

{#if data && headers && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">
            <Button gradient color="blue" on:click={()=> createModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>                        
                &nbsp;
                Create
            </Button>

            <Button disabled={buttonDisabled} gradient color="purple" on:click={()=> createTasksModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                </svg>                                 
                &nbsp;
                Create Tasks
            </Button>

            <Button disabled={buttonDisabled} gradient color="purple" on:click={openBulkSetService}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                </svg>                                           
                &nbsp;
                Set Service
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
                            {#each headers.data as header}
                                {#if header.column_name == 'group'}
                                    <Th {handler} orderBy={(row => row.group?.name)}>Group</Th>
                                {:else if allColumns || header.is_master}
                                    <Th {handler} orderBy={row => row[header.column_name]}>{header.display_name}</Th>
                                {/if}
                            {/each}
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}></ThSearch>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            {#each headers.data as header}
                                {#if header.column_name == 'group'}
                                    <ThSearch {handler} filterBy={(row => row.group?.name || "-")}/>
                                {:else if allColumns || header.is_master}
                                    <ThSearch {handler} filterBy={row => row[header.column_name]}/>
                                {/if}
                            {/each}
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                </TableBodyCell>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" oid={row.id} on:click={openActionsModal} >{row.id}</TableBodyCell>
                                {#each headers.data as header}
                                    {#if header.column_name == 'group'}
                                        <TableBodyCell>{row.group?.name || "-"}</TableBodyCell>
                                    {:else if allColumns || header.is_master}
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
                                            {:else if header.column_type == 'Dropdown'}
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
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete selected clients?</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">Add new entry</h3>
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            {#each headers.data as header}
                {#if header.column_name == 'group'}
                    <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                        <span class="text-end">Group</span>
                        <IdSelect class="col-span-2 !m-0" required items={client_list} bind:value={createdObject.group_id}/>
                    </Label>
                {:else}
                    <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                        {#if header.column_type=="Text"}
                            <span class="text-end">{header.display_name}</span>
                            <Input class="col-span-2 !m-0" type="text" bind:value={createdObject[header.column_name]}/>
                        {:else if header.column_type=="Date"}
                            <span class="text-end">{header.display_name}</span>
                            <SveltyPicker inputClasses="col-span-2 !m-0" format="d M yyyy" bind:value={createdObject[header.column_name]} />
                        {:else if header.column_type=="Checkbox"}
                            <span class="text-end">{header.display_name}</span>
                            <Toggle class="col-span-2 !m-0" bind:value={createdObject[header.column_name]} bind:checked={createdObject[header.column_name]}></Toggle>
                        {:else if header.column_type=="Dropdown"}
                            <span class="text-end">{header.display_name}</span>
                            <Select class="col-span-2 !m-0" bind:value={createdObject[header.column_name]} items={header.column_info.options}/>
                        {:else}
                            <p class="justify-self-end">{header.display_name}</p>
                            <input type="file" accept="image/*" on:input={event => createdObject[header.column_name]=event.target.files[0]} class="col-span-2 w-full border border-gray-300 rounded-lg cursor-pointer !m-0" />
                        {/if}
                    </Label>
                {/if}
            {/each}
        </div>

        <hr class="col-span-3"/>
        <div class="col-span-3 grid grid-cols-5 text-center gap-x-3 gap-y-5">
            <h2 class="text-left">Services</h2>
            <h2>Frequency</h2>
            <h2>Next Date</h2>
            <h2>End Date</h2>
            <h2>Count</h2>
        </div>
        <div class="col-span-3 grid grid-cols-5 text-center gap-x-3 gap-y-5">
            {#each services as service}
                {@const required = createdObject.services[service.value].subscribed && createdObject.services[service.value].frequency != null}

                <Checkbox bind:checked={createdObject.services[service.value].subscribed}>{service.name}</Checkbox>
                <Select {required} bind:value={createdObject.services[service.value].frequency} items={frequency}/>
                <SveltyPicker format="d M yyyy" {required} bind:value={createdObject.services[service.value].next}/>
                <SveltyPicker format="d M yyyy" {required} bind:value={createdObject.services[service.value].end_date}/>
                <Input min="1" required={createdObject.services[service.value].subscribed} type="number" bind:value={createdObject.services[service.value].count}/>
            {/each}
        </div>

        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject=emptyCreatedObject}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={createTasksModal} size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={createTasks}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Create Tasks</h3>
            
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Template</span>
                <Select class="col-span-8" items={taskTemplates} value={0} on:change={loadTaskTemplate}/>
            </Label>

            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Title</span>
                <Input class="col-span-8" required type="text" placeholder="Title" bind:value={createTasksObject.title}/>
            </Label>

            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Service</span>
                <Select class="col-span-2 !m-0" required items={all_services} bind:value={createTasksObject.service_id} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Client Ids</span>
                <Input class="col-span-2 !m-0" readonly value={JSON.stringify([...selectedRows]).slice(1,-1)}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Assigned To</span>
                <Select class="col-span-2 !m-0" items={users} bind:value={createTasksObject.assigned_to} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Status</span>
                <Select class="col-span-2 !m-0" required items={task_status} bind:value={createTasksObject.status}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Priority</span>
                <Select class="col-span-2 !m-0" required items={priority} bind:value={createTasksObject.priority}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-9 gap-x-3 col-span-3 items-center">
                <span class="text-end">Description</span>
                <Textarea class="col-span-8" placeholder="Description" rows="4" bind:value={createTasksObject.description}/>
            </Label>
        </div>

        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createTasksModal=false;createTasksObject={priority:1,status:0}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={bulkServiceModal} size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-4" on:submit|preventDefault={bulkSetService}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-4">Set Services</h3>
        
        <p class="col-span-3 my-auto"><span class="text-red-400">*</span> This will overwrite existing service dates</p>

        <Label class="my-auto">
            <span class="text-end">&nbsp;</span>
            <Toggle bind:checked={removeOldServices} >Remove old services</Toggle>
        </Label>
        
        <Label class="space-y-2 col-span-4">
            <span class="mb-2">Client Id's</span>
            <Input readonly value={JSON.stringify([...selectedRows]).slice(1,-1)}/>
        </Label>
        
        <div class="col-span-4 grid grid-cols-4 text-center gap-x-3 gap-y-5">
            <h2 class="text-left">Services</h2>
            <h2>Frequency</h2>
            <h2>Next Date</h2>
            <h2>End Date</h2>
            <h2>Count</h2>
        </div>
        
        {#each services as service}
            {@const required = bulkServiceData[service.value].subscribed && bulkServiceData[service.value].frequency != null}

            <Checkbox bind:checked={bulkServiceData[service.value].subscribed}>{service.name}</Checkbox>
            <Select {required} bind:value={bulkServiceData[service.value].frequency} items={frequency}/>
            <SveltyPicker format="d M yyyy" {required} bind:value={bulkServiceData[service.value].next}/>
            <SveltyPicker format="d M yyyy" {required} bind:value={bulkServiceData[service.value].end_date}/>
            <Input min="1" required={bulkServiceData[service.value].subscribed} type="number" bind:value={bulkServiceData[service.value].count}/>
        {/each}

        <div class="col-span-4 grid gap-6 grid-cols-2">
            <Button type="submit" disabled={actionsIndex < 0} class="w-full">Set</Button>
            <Button on:click={()=>{bulkServiceModal=false}} color="alternative" class="w-full">Close</Button>
        </div>
        
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">View/Update Client</h3>
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">ID</span>
                <Input class="col-span-2 !m-0" readonly type="text" bind:value={actionsObject.id} />
            </Label>

            {#each headers.data as header}
                {#if header.column_name == 'group'}
                    <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                        <span class="text-end">Group</span>
                        <IdSelect class="col-span-2 !m-0" required items={client_list} bind:value={actionsObject.group_id}/>
                    </Label>
                {:else}
                    <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                        {#if header.column_type=="Text"}
                            <span class="text-end">{header.display_name}</span>
                            <Input class="col-span-2 !m-0" bind:value={actionsObject[header.column_name]}/>
                        {:else if header.column_type=="Date"}
                            <span class="text-end">{header.display_name}</span>
                            <SveltyPicker inputClasses="col-span-2 !m-0" format="d M yyyy" bind:value={actionsObject[header.column_name]} />
                        {:else if header.column_type=="Checkbox"}
                            <span class="text-end">{header.display_name}</span>
                            <Toggle class="col-span-2 !m-0"  bind:value={actionsObject[header.column_name]} bind:checked={actionsObject[header.column_name]}></Toggle>
                        {:else if header.column_type=="Dropdown"}
                            <span class="text-end">{header.display_name}</span>
                            <Select class="col-span-2 !m-0" bind:value={actionsObject[header.column_name]} items={header.column_info.options}/>
                        {:else}
                            {#if typeof(actionsObject[header.column_name]) == 'string'}
                                <span class="text-end">{header.display_name}</span>
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
                                <p class="justify-self-end">{header.display_name}</p>
                                <input type="file" accept="image/*" on:input={event => actionsObject[header.column_name]=event.target.files[0]} class="w-full border border-gray-300 rounded-lg cursor-pointer col-span-2" />
                            {/if}
                        {/if}
                    </Label>
                {/if}
            {/each}
        </div>

        {#if actionsObject.group && actionsObject.group.id != actionsObject.id}
            <hr class="col-span-3"/>
            <h2 class="col-span-3">Parent Company</h2>
            <Button oid={actionsObject.group.id} on:click={openActionsModal}>{actionsObject.group.name}</Button>
        {/if}

        {#if actionsObject.subsidiary.length > 0 && (actionsObject.subsidiary.length != 1 || actionsObject.subsidiary[0].id != actionsObject.id)}
            <hr class="col-span-3"/>
            <h2 class="col-span-3">Subsidiary Companies</h2>
            <div class="col-span-3 grid grid-cols-5 text-center gap-x-3">
                {#each actionsObject.subsidiary as subsidiary}
                    {#if subsidiary.id != actionsObject.id}
                        <Button oid={subsidiary.id} on:click={openActionsModal}>{subsidiary.name}</Button>
                    {/if}
                {/each}
            </div>
        {/if}

        <hr class="col-span-3"/>
        <div class="col-span-3 grid grid-cols-5 text-center gap-x-3 gap-y-5">
            <h2 class="text-left">Services</h2>
            <h2>Frequency</h2>
            <h2>Next Date</h2>
            <h2>End Date</h2>
            <h2>Count</h2>
        </div>
        <div class="col-span-3 grid grid-cols-5 text-center gap-x-3 gap-y-5">
            {#each services as service}
                {@const required = actionsObject.services[service.value].subscribed && actionsObject.services[service.value].frequency != null}

                <Checkbox bind:checked={actionsObject.services[service.value].subscribed}>{service.name}</Checkbox>
                <Select {required} bind:value={actionsObject.services[service.value].frequency} items={frequency}/>
                <SveltyPicker format="d M yyyy" {required} bind:value={actionsObject.services[service.value].next}/>
                <SveltyPicker format="d M yyyy" {required} bind:value={actionsObject.services[service.value].end_date}/>
                <Input min="1" required={actionsObject.services[service.value].subscribed} type="number" bind:value={actionsObject.services[service.value].count}/>
            {/each}
        </div>
        
        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button type="submit" disabled={actionsIndex < 0} class="w-full">Update</Button>
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