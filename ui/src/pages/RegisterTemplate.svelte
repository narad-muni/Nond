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
        Toggle,
        Alert,
        Select,
        Card,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import { location } from 'svelte-spa-router'
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import { SortableList } from '@jhubbardsf/svelte-sortablejs';

    // Intialization

    let createModal, actionsModals, deleteModal, createLinked, changeOrderModal;
    let selectedRows = new Set();

    let data, createdObject={column_info:{options: [""]}}, actionsIndex, actionsObject, table, client_columns;
    let handler, rows, orderable_columns = [];

    let error="", success="";
    const type_list = [
        {name: 'Text',value: 'Text'},
        {name: 'Date',value: 'Date'},
        {name: 'File',value: 'File'},
        {name: 'Checkbox',value: 'Checkbox'},
        {name: 'Dropdown',value: 'Dropdown'},
    ];
    
    let register_id;
    
    location.subscribe(val => {
        register_id = val.substr(val.lastIndexOf('/')+1);

        // fetch data

        (async ()=>{
            client_columns = await utils.get('/api/master_template/options/client');
            table = await utils.get('/api/register_master/'+register_id);
            data = await utils.get('/api/register_template/'+register_id);

            table = table.data;
            client_columns = client_columns.data;

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
    });

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

    function changeOrder(e){
        const from = e.oldIndex;
        const to = e.newIndex;

        orderable_columns.splice(to, 0, orderable_columns.splice(from, 1)[0]);
        orderable_columns = orderable_columns;
    }

    async function updateOrder(){
        const resp = await utils.put_json('/api/register_template/set_order',{columns: orderable_columns});

        if(resp.status == 'success'){
            changeOrderModal = false;

            data = await utils.get('/api/register_template/'+register_id);

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
        }else{
            error = resp.message;
        }
    }

    async function openOrderModal(){
        orderable_columns = $rows;
        orderable_columns.sort((a,b) => a.order > b.order ? 1 : -1)
        changeOrderModal = true;
    }

    async function openActionsModal(e){
        let oid = e.target.innerText;
        data.find((e,i) => {
            if(e.id == oid){
                actionsIndex = i;
                return true;
            }
        });

        actionsObject = await utils.get('/api/register_template/'+register_id+'/'+data[actionsIndex].id);

        if(actionsObject.status != 'success'){
            error = actionsObject.message;
            return;
        }

        actionsObject = actionsObject.data;
        
        actionsModals = true;
    }

    async function updateData(){
        const resp = await utils.put_json('/api/register_template/',actionsObject);

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
        const resp = await utils._delete('/api/register_template/destroy/',{id:Array.from(selectedRows)});

        if(resp.status == 'success'){
            data = await utils.get('/api/register_template/'+register_id);

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
        }else{
            error = resp.message;
        }
    }

    async function createData(){
        createdObject.table_id = register_id;
        let resp = await utils.post_json('/api/register_template/',createdObject);

        if(resp.status == 'success'){
            resp.data._selected = false;
            data.push(resp.data);
            handler.setRows(data);
            createModal = false;
            createLinked = false;
            createdObject = {column_info:{options: [""]}};
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

            <Button gradient color="green" on:click={()=> createLinked = true}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>                                          
                &nbsp;
                Link
            </Button>

            <Button gradient color="blue" on:click={()=> openOrderModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                &nbsp;
                Change Order
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
                            <Th {handler} orderBy={row => row.id || "-"}>ID</Th>
                            <Th {handler} >Register</Th>
                            <Th {handler} orderBy={row => row.display_name || "-"}>Column Name</Th>
                            <Th {handler} orderBy={row => row.column_type || "-"}>Type</Th>
                            <Th {handler} orderBy={row => row.client_column_id != null ? "Yes" : "No"}>Client Column</Th>
                            <Th {handler} orderBy={row => row.order || "-"}>Order</Th>
                            <Th {handler} orderBy={row => row.master ? "Yes" : "No"}>Is Master</Th>
                            <Th {handler} orderBy={row => row.rollover ? "Yes" : "No"}>Rollover</Th>
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row._selected ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} />
                            <ThSearch {handler} filterBy={row => row.display_name || "-"}/>
                            <ThSearch {handler} filterBy={row => row.column_type || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client_column_id != null ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.order || "-"}/>
                            <ThSearch {handler} filterBy={row => row.master ? "Yes" : "No"}/>
                            <ThSearch {handler} filterBy={row => row.rollover ? "Yes" : "No"}/>
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row, index}
                            {#if row.id >= 0}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        <Checkbox oid={row.id} on:change={addSelection} bind:checked={row._selected}/>
                                    </TableBodyCell>
                                    {#if row.client_column_id != null}
                                        <TableBodyCell class="cursor-not-allowed bg-gray-100 hover:bg-gray-200" >{row.id}</TableBodyCell>
                                    {:else}
                                        <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" on:click={openActionsModal} >{row.id}</TableBodyCell>
                                    {/if}
                                    <TableBodyCell>
                                        {table.name || "-"}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {row.display_name || "-"}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {row.column_type || "-"}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {row.client_column_id != null ? "Yes" : "No"}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {row.order || "-"}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Checkbox disabled checked={row.master=="true" || row.master}/>
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Checkbox disabled checked={row.rollover=="true" || row.rollover}/>
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/if}
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
        <h3 class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">This will remove all data from corresponding column!</h3>
        <h3 class="mb-5 text-sm font-normal text-gray-500 dark:text-gray-400">Active registers linking this column will also be cleared!</h3>
        <Button color="red" on:click={deleteSelected} class="mr-2">Yes, I'm sure</Button>
        <Button color='alternative'>No, cancel</Button>
    </div>
</Modal>

<Modal bind:open={createModal} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Create Entry</h3>

        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Column Name</span>
                <Input class="col-span-2 !m-0" required bind:value={createdObject.display_name}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Column Type</span>
                <Select class="col-span-2 !m-0" required items={type_list} bind:value={createdObject.column_type} />
            </Label>


            {#if createdObject.column_type == 'Dropdown'}

                {#each createdObject.column_info.options as  option, i }
                    <Label class="space-y-2 grid gap-6 grid-cols-4 col-span-2">
                        <Input required bind:value={createdObject.column_info.options[i]} class="col-span-3 !m-0"></Input>
                        {#if i > 0}
                            <Button class="m-0" on:click={() => {createdObject.column_info.options.splice(i, 1), createdObject = createdObject}} color="red">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </Button>
                        {/if}
                    </Label>
                {/each}

                <Label class="space-y-2 grid gap-6 grid-cols-4 col-span-2">
                    <span class="col-span-3"></span>
                    <Button on:click={() => {createdObject.column_info.options.push(""), createdObject = createdObject}} class="m-0" color="blue">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>                  
                    </Button>
                </Label>
            {/if}

            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Is Master</span>
                <Toggle class="col-span-2 !m-0" bind:value={createdObject.master} bind:checked={createdObject.master}></Toggle>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Rollover</span>
                <Toggle class="col-span-2 !m-0" bind:value={createdObject.rollover} bind:checked={createdObject.rollover}></Toggle>
            </Label>
        </div>

        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createModal=false;createdObject={column_info:{options: [""]}}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={createLinked} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={createData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Create Linked Column</h3>
        <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-2 items-center">
            <span class="text-end">Column Name</span>
            <Select class="col-span-2 !m-0" items={client_columns} bind:value={createdObject.client_column_id}/>
        </Label>
        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button type="submit" class="w-full">Create</Button>
            <Button on:click={()=>{createLinked=false;createdObject={column_info:{options: [""]}}}} color="alternative" class="w-full">Cancel</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={actionsModals} placement="top-center" size="lg">
    <form class="grid gap-6 mb-6 md:grid-cols-2" on:submit|preventDefault={updateData}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-2">View/Update Entry</h3>
        
        <div class="grid grid-cols-3 col-span-3 gap-x-3 gap-y-6">
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Id</span>
                <Input class="col-span-2 !m-0" readonly bind:value={actionsObject.id} />
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Column Name</span>
                <Input class="col-span-2 !m-0" required bind:value={actionsObject.display_name}/>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Column Type</span>
                <Select class="col-span-2 !m-0" required items={type_list} bind:value={actionsObject.column_type} />
            </Label>

            {#if actionsObject.column_type == 'Dropdown'}

                {#each actionsObject.column_info.options as  option, i }
                    <Label class="space-y-2 grid gap-6 grid-cols-4 col-span-2">
                        <Input required bind:value={actionsObject.column_info.options[i]} class="col-span-3 !m-0"></Input>
                        {#if i > 0}
                            <Button class="m-0" on:click={() => {actionsObject.column_info.options.splice(i, 1), actionsObject = actionsObject}} color="red">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </Button>
                        {/if}
                    </Label>
                {/each}

                <Label class="space-y-2 grid gap-6 grid-cols-4 col-span-2">
                    <span class="col-span-3"></span>
                    <Button on:click={() => {actionsObject.column_info.options.push(""), actionsObject = actionsObject}} class="m-0" color="blue">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>                  
                    </Button>
                </Label>
            {/if}

            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Is Master</span>
                <Toggle class="col-span-2 !m-0" bind:value={actionsObject.master} bind:checked={actionsObject.master}></Toggle>
            </Label>
            <Label class="space-y-2 grid grid-cols-3 gap-x-3 col-span-1 items-center">
                <span class="text-end">Rollover</span>
                <Toggle class="col-span-2 !m-0" bind:value={actionsObject.rollover} bind:checked={actionsObject.rollover}></Toggle>
            </Label>
        </div>

        <div class="col-span-2 grid gap-6 grid-cols-2">
            <Button  type="submit" class="w-full">Update</Button>
            <Button on:click={()=>actionsModals=false} color="alternative" class="w-full">Close</Button>
        </div>
    </form>
</Modal>

<Modal bind:open={changeOrderModal} placement="top-center" size="xl">
    <h3 class="text-xl mt-4 font-medium text-gray-900 dark:text-white p-0 md:col-span-2">Drag columns to change order</h3>
    {#key orderable_columns}
        <SortableList onSort={changeOrder} class="grid grid-cols-3 gap-4">
            {#each orderable_columns as column, i}
                <Card>
                    <span class="flex justify-between items-end">
                        {i + 1} {column.display_name}
                        <span class="text-xs italic">
                            {#if column.is_master}
                                (master)
                            {/if}
                        </span>
                    </span>
                </Card>
            {/each}
        </SortableList>
    {/key}

    <div class="col-span-2 grid gap-6 grid-cols-2">
        <Button on:click={()=>{updateOrder()}} class="w-full">Update</Button>
        <Button on:click={()=>changeOrderModal=false} color="alternative" class="w-full">Close</Button>
    </div>
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