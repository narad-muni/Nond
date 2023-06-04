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
        Select,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import { active_registers, archived_registers } from '../global/stores';
    import SveltyPicker from '../component/svelty-picker';

    // Intialization

    let createModal, actionsModals, deleteModal, archiveModal;
    let selectedRows = new Set();

    const date = (new Date).toDateString().split(" ");// gives "Mon Apr 10 2023"

    const currDate = date[1]+" "+date[2]+" "+date[3];// convert above to Apr 10, 2023

    let data, createdObject={version:currDate,next:""},services, actionsIndex, actionsObject;
    let handler, rows;
    let error="";

    const minNextDate = new Date(
            (new Date)
                .setDate(new Date().getDate() + 1)
        )
        .toJSON().slice(0, 10);

    const frequency = [
        {name: "Daily", value:"1 day"},
        {name: "Weekly", value:"1 week"},
        {name: "Bi Weekly", value:"2 weeks"},
        {name: "Monthly", value:"1 month"},
        {name: "Quarterly", value:"3 months"},
        {name: "Half Yearly", value:"6 months"},
        {name: "Yearly", value:"1 year"},
        {name: "Never", value:null}
    ];

    // fetch data

    (async ()=>{
        services = await utils.get('/api/service/options');
        data = await utils.get('/api/register_master/');

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

    function setVersion(){
        createdObject.version = currDate + "  -  " + createdObject.next;
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

    async function openActionsModal(e){
        let oid = e.target.innerText;
        data.find((e,i) => {
            if(e.id == oid){
                actionsIndex = i;
                return true;
            }
        });

        actionsObject = await utils.get('/api/register_master/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
            return;
        }

        actionsObject = actionsObject.data;
        actionsModals = true;
    }

    async function updateData(){
        const resp = await utils.put_json('/api/register_master/',actionsObject);

        if(resp.status == 'success'){
            //trigger nav bar update
            active_registers.set(actionsObject);

            resp.data._selected = data[actionsIndex]._selected;
            resp.data.service = services.find(e => e.value == resp.data.service_id);
            data[actionsIndex] = resp.data;
            handler.setRows(data);
            actionsModals = false;
        }else{
            error = resp.message || "";
        }
        
    }

    async function deleteSelected(){
        const resp = await utils._delete('/api/register_master/destroy/',{id:Array.from(selectedRows)});

        if(resp.status == 'success'){
            //trigger nav bar update
            active_registers.set(selectedRows);

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

    async function archiveRegister(){
        const resp = await utils.put_json('/api/register_master/archive/',{id:Array.from(selectedRows)});

        if(resp.status == 'success'){
            //trigger nav bar update
            active_registers.set(selectedRows);
            archived_registers.set(selectedRows);

            for (let i = 0; i < data.length; i++) {
                if (selectedRows.has(data[i].id)) {
                    data[i]._selected = false;
                    data[i].active = false;
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
        let resp = await utils.post_json('/api/register_master/',createdObject);

        if(resp.status == 'success'){
            //trigger nav bar update
            active_registers.set(createdObject);
            
            resp.data._selected = false;
            resp.data.service = services.find(e => e.value == resp.data.service_id);
            data = [...data,resp.data];
            handler.setRows(data);
            createModal = false;
            createdObject = {version:currDate,next:""};
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

            <Button disabled={buttonDisabled} gradient color="yellow" on:click={()=> archiveModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>                  
                &nbsp;
                Archive
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
                <Table>
                    <thead>
                        <tr>
                            <th>
                                <Checkbox on:change={addSelection} {checked} {indeterminate}/>
                            </th>
                            <Th {handler} orderBy="id">ID</Th>
                            <Th {handler} orderBy="name">Name</Th>
                            <Th {handler} orderBy="version">Version</Th>
                            <Th {handler} orderBy={row => row.service.name}>Service</Th>
                            <Th {handler} orderBy={row => row.active}>Active</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.version || "-"}/>
                            <ThSearch {handler} filterBy={row => row.service.name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.active ? "Yes" : "No"}/>
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                </TableBodyCell>
                                {#if row.active}
                                    <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" on:click={openActionsModal} >{row.id}</TableBodyCell>
                                {:else}
                                    <TableBodyCell class="cursor-not-allowed bg-gray-100" >{row.id}</TableBodyCell>
                                {/if}
                                <TableBodyCell>
                                    {row.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.version || "-"}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {row.service.name || "-"}
                                </TableBodyCell>
                                <TableBodyCell>    
                                    {row.active ? "Yes" : "No"}
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
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete selected registers?</h3>
        <h5 class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">This will also delete any active register.</h5>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={archiveModal} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to archive selected registers?</h3>
        <h5 class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">This will also delete templates</h5>
        <Button color="red" on:click={archiveRegister} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">Create Register</h3>
        <Label class="space-y-2">
            <span>Name</span>
            <Input required bind:value={createdObject.name}/>
        </Label>
        <Label class="space-y-2">
            <span>Next Rotation</span>
            <SveltyPicker on:change={setVersion} required startDate={minNextDate} format="M d yyyy" bind:value={createdObject.next} />
        </Label>
        <Label class="space-y-2">
            <span>Rotation Frequency</span>
            <Select required items={frequency} bind:value={createdObject.frequency} />
        </Label>
        <Label class="space-y-2">
            <span>Rotation Strategy</span>
            <Select required items={[{name:"Delete",value:"delete"},{name:"Archive",value:"archive"}]} bind:value={createdObject.rotation_strategy} />
        </Label>
        <Label class="space-y-2">
            <span>Version</span>
            <Input required bind:value={createdObject.version}/>
        </Label>
        <Label class="space-y-2">
            <span>Service</span>
            <Select required items={services} bind:value={createdObject.service_id} />
        </Label>
        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject={version:currDate,next:""}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">View/Update Entry</h3>
        <Label class="space-y-2">
            <span>Name</span>
            <Input required bind:value={actionsObject.name}/>
        </Label>
        <Label class="space-y-2">
            <span>Next Rotation</span>
            <SveltyPicker startDate={minNextDate} format="M d yyyy" bind:value={actionsObject.scheduler.next} />
        </Label>
        <Label class="space-y-2">
            <span>Rotation Frequency</span>
            <Select items={frequency} bind:value={actionsObject.scheduler.frequency} />
        </Label>
        <Label class="space-y-2">
            <span>Rotation Strategy</span>
            <Select required items={[{name:"Delete",value:"delete"},{name:"Archive",value:"archive"}]} bind:value={actionsObject.scheduler.data.rotation_strategy} />
        </Label>
        <Label class="space-y-2">
            <span>Version</span>
            <Input required bind:value={actionsObject.version}/>
        </Label>
        <Label class="space-y-2">
            <span>Service</span>
            <Select required items={services} bind:value={actionsObject.service_id} />
        </Label>
        <div class="col-span-3 grid gap-6 grid-cols-2">
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