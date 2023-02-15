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
        Helper,
        Input,
        Toggle,
        Alert,
        Textarea,
        Select
    } from "flowbite-svelte";

    import { DataHandler, ThFilter } from "@vincjo/datatables";
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import { types } from "joi";

    // Intialization

    let createModal, actionsModals, deleteModal;
    let selectedRows = new Set();

    let data, createdObject={read:{},create:{},update:{},remove:{},destroy:{}}, actionsIndex, actionsObject, templateFile;
    let handler, rows;
    let automaticAssign = [
        {name:"Divide",value:"Divide"},
        {name:"By Client",value:"By Client"}
    ]
    let error="", success="", assignedUser, autoAssignType, users=[{value:1,name:"Saumil"},{value:2,name:"Rajesh"},{value:-1,name:"Automatic"}];

    // fetch data

    (async ()=>{
        data = await utils.get('/api/role/');
        if(data.status != 'success'){
            error = String(data.message);
            return;
        }
        data = data.data;

        data.forEach((v) => {
            v["_selected"] = 0;
        });

        handler = new DataHandler(
            data,
            {
                rowsPerPage:50
            }
        )

        rows = handler.getRows();
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

        actionsObject = await utils.get('/api/role/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
            return;
        }

        actionsObject = actionsObject.data;
        
        actionsModals = true;
    }

    async function updateData(){
        const resp = await utils.put_json('/api/role/',actionsObject);

        if(resp.status == 'success'){
            resp.data._selected = data[actionsIndex]._selected;
            data[actionsIndex] = resp.data;
            handler.setRows(data);
            actionsModals = false;
        }else{
            error = resp.message || "";
        }
        
    }

    async function deleteSelected(){
        const resp = await utils._delete('/api/role/',{id:Array.from(selectedRows)});

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
        let resp = await utils.post_json('/api/role/',createdObject);

        if(resp.status == 'success'){
            resp.data._selected = false;
            data.push(resp.data);
            handler.setRows(data);
            createModal = false;
        }else{
            error = resp.message | "";
        }
    }

</script>

<main class="flex flex-col w-full min-w-0 max-h-full p-2">
    <div class="pl-4 flex gap-x-4 my-2">
        <Button gradient color="blue" on:click={()=> createModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>                        
            &nbsp;
            Create
        </Button>

        <Button disabled={buttonDisabled} gradient color="red" on:click={()=> deleteModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>              
            &nbsp;
            Delete
        </Button>
    </div>

    <div class="min-h-0 pl-4">
        {#if data && handler}
            <DataTable {handler}>
                <Table>
                    <thead>
                        <tr>
                            <th>
                                <Checkbox on:change={addSelection} {checked} {indeterminate}/>
                            </th>
                            <Th {handler} orderBy="id">id</Th>
                            <Th {handler} orderBy="name">name</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy="_selected"/>
                            <ThSearch {handler} filterBy="id"/>
                            <ThSearch {handler} filterBy="name"/>
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row, index}
                            <TableBodyRow>
                                <TableBodyCell>
                                    <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                </TableBodyCell>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" on:click={openActionsModal} >{row.id}</TableBodyCell>
                                <TableBodyCell>
                                    {row.name}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </DataTable>
        {/if}
    </div>
</main>

<!-- Modal -->

<!-- Modals -->

<Modal bind:open={deleteModal} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete selected rows?</h3>
        <h3 class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">Users with this role will be assigned default viewer role</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">Create Entry</h3>
        <Label class="space-y-2">
            <span>name</span>
            <Input required bind:value={createdObject.name}/>
        </Label>
        <Label class="space-y-2">
            <span>Read</span>
            <div>
                <Checkbox bind:checked={createdObject.read.client} >Client</Checkbox>
                <Checkbox bind:checked={createdObject.read.company} >Company</Checkbox>
                <Checkbox bind:checked={createdObject.read.employee} >Employee</Checkbox>
                <Checkbox bind:checked={createdObject.read.template} >Template</Checkbox>
                <Checkbox bind:checked={createdObject.read.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={createdObject.read.register} >Register</Checkbox>
                <Checkbox bind:checked={createdObject.read.role} >Role</Checkbox>
                <Checkbox checked disabled>Task</Checkbox>
                <Checkbox bind:checked={createdObject.read.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={createdObject.read.lead} >Lead</Checkbox>
                <Checkbox bind:checked={createdObject.read.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Create</span>
            <div>
                <Checkbox bind:checked={createdObject.create.client} >Client</Checkbox>
                <Checkbox bind:checked={createdObject.create.company} >Company</Checkbox>
                <Checkbox bind:checked={createdObject.create.employee} >Employee</Checkbox>
                <Checkbox bind:checked={createdObject.create.template} >Template</Checkbox>
                <Checkbox bind:checked={createdObject.create.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={createdObject.create.register} >Register</Checkbox>
                <Checkbox bind:checked={createdObject.create.role} >Role</Checkbox>
                <Checkbox bind:checked={createdObject.create.task} >Task</Checkbox>
                <Checkbox bind:checked={createdObject.create.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={createdObject.create.lead} >Lead</Checkbox>
                <Checkbox bind:checked={createdObject.create.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Update</span>
            <div>
                <Checkbox bind:checked={createdObject.update.client} >Client</Checkbox>
                <Checkbox bind:checked={createdObject.update.company} >Company</Checkbox>
                <Checkbox bind:checked={createdObject.update.employee} >Employee</Checkbox>
                <Checkbox bind:checked={createdObject.update.template} >Template</Checkbox>
                <Checkbox bind:checked={createdObject.update.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={createdObject.update.register} >Register</Checkbox>
                <Checkbox bind:checked={createdObject.update.role} >Role</Checkbox>
                <Checkbox bind:checked={createdObject.update.task} >Task</Checkbox>
                <Checkbox bind:checked={createdObject.update.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={createdObject.update.lead} >Lead</Checkbox>
                <Checkbox bind:checked={createdObject.update.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Remove</span>
            <div>
                <Checkbox bind:checked={createdObject.remove.client} >Client</Checkbox>
                <Checkbox bind:checked={createdObject.remove.company} >Company</Checkbox>
                <Checkbox bind:checked={createdObject.remove.employee} >Employee</Checkbox>
                <Checkbox bind:checked={createdObject.remove.template} >Template</Checkbox>
                <Checkbox bind:checked={createdObject.remove.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={createdObject.remove.register} >Register</Checkbox>
                <Checkbox bind:checked={createdObject.remove.role} >Role</Checkbox>
                <Checkbox bind:checked={createdObject.remove.task} >Task</Checkbox>
                <Checkbox bind:checked={createdObject.remove.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={createdObject.remove.lead} >Lead</Checkbox>
                <Checkbox bind:checked={createdObject.remove.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Destroy</span>
            <div>
                <Checkbox bind:checked={createdObject.destroy.client} >Client</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.company} >Company</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.employee} >Employee</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.template} >Template</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.register} >Register</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.role} >Role</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.task} >Task</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.lead} >Lead</Checkbox>
                <Checkbox bind:checked={createdObject.destroy.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>createModal=false} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3" on:submit|preventDefault>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-1">View/Update Entry</h3>
        <Label class="space-y-2">
            <span>ID</span>
            <Input value={actionsObject.id} readonly/>
        </Label>
        <Label class="space-y-2">
            <span>name</span>
            <Input required bind:value={actionsObject.name}/>
        </Label>
        <Label class="space-y-2">
            <span>Read</span>
            <div>
                <Checkbox bind:checked={actionsObject.read.client} >Client</Checkbox>
                <Checkbox bind:checked={actionsObject.read.company} >Company</Checkbox>
                <Checkbox bind:checked={actionsObject.read.employee} >Employee</Checkbox>
                <Checkbox bind:checked={actionsObject.read.template} >Template</Checkbox>
                <Checkbox bind:checked={actionsObject.read.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={actionsObject.read.register} >Register</Checkbox>
                <Checkbox bind:checked={actionsObject.read.role} >Role</Checkbox>
                <Checkbox checked disabled>Task</Checkbox>
                <Checkbox bind:checked={actionsObject.read.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={actionsObject.read.lead} >Lead</Checkbox>
                <Checkbox bind:checked={actionsObject.read.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Create</span>
            <div>
                <Checkbox bind:checked={actionsObject.create.client} >Client</Checkbox>
                <Checkbox bind:checked={actionsObject.create.company} >Company</Checkbox>
                <Checkbox bind:checked={actionsObject.create.employee} >Employee</Checkbox>
                <Checkbox bind:checked={actionsObject.create.template} >Template</Checkbox>
                <Checkbox bind:checked={actionsObject.create.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={actionsObject.create.register} >Register</Checkbox>
                <Checkbox bind:checked={actionsObject.create.role} >Role</Checkbox>
                <Checkbox bind:checked={actionsObject.create.task} >Task</Checkbox>
                <Checkbox bind:checked={actionsObject.create.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={actionsObject.create.lead} >Lead</Checkbox>
                <Checkbox bind:checked={actionsObject.create.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Update</span>
            <div>
                <Checkbox bind:checked={actionsObject.update.client} >Client</Checkbox>
                <Checkbox bind:checked={actionsObject.update.company} >Company</Checkbox>
                <Checkbox bind:checked={actionsObject.update.employee} >Employee</Checkbox>
                <Checkbox bind:checked={actionsObject.update.template} >Template</Checkbox>
                <Checkbox bind:checked={actionsObject.update.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={actionsObject.update.register} >Register</Checkbox>
                <Checkbox bind:checked={actionsObject.update.role} >Role</Checkbox>
                <Checkbox bind:checked={actionsObject.update.task} >Task</Checkbox>
                <Checkbox bind:checked={actionsObject.update.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={actionsObject.update.lead} >Lead</Checkbox>
                <Checkbox bind:checked={actionsObject.update.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Remove</span>
            <div>
                <Checkbox bind:checked={actionsObject.remove.client} >Client</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.company} >Company</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.employee} >Employee</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.template} >Template</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.register} >Register</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.role} >Role</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.task} >Task</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.lead} >Lead</Checkbox>
                <Checkbox bind:checked={actionsObject.remove.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <Label class="space-y-2">
            <span>Destroy</span>
            <div>
                <Checkbox bind:checked={actionsObject.destroy.client} >Client</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.company} >Company</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.employee} >Employee</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.template} >Template</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.master_template} >Master Template</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.register} >Register</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.role} >Role</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.task} >Task</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.scheduler} >Scheduler</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.lead} >Lead</Checkbox>
                <Checkbox bind:checked={actionsObject.destroy.invoice} >Invoice</Checkbox>
            </div>
        </Label>
        <div class="col-span-3 grid gap-6 grid-cols-2">
            <Button on:click={updateData} type="submit" class="w-full">Update</Button>
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

{#if success.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="green" dismissable on:close={()=>success=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">success!</span> {success}
        </Alert>
    </div>
{/if}