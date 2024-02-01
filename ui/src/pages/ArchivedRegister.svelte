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
        Select,
    } from "flowbite-svelte";

    import { DataHandler } from '../component/datatables';
    import Th from "../component/Th.svelte";
    import ThSearch from "../component/ThSearch.svelte";
    import DataTable from "../component/DataTable.svelte";
    import utils from '../utils';
    import { location } from 'svelte-spa-router';
    import IdSelect from "../component/IdSelect.svelte";
    import SveltyPicker from '../component/svelty-picker';

    // Intialization

    let actionsModals, allColumns = false, register_id;

    let headers, client_list, data, actionsIndex, actionsObject;
    let handler, rows;

    let error="";

    const minNextDate = new Date(
            (new Date)
                .setDate(new Date().getDate() + 1)
        )
        .toJSON().slice(0, 10);

    // fetch data

    location.subscribe(val => {
        (async ()=>{
            register_id = val.substr(val.lastIndexOf('/')+1);
            client_list = await utils.get('/api/client/options');
            headers = await utils.get('/api/register_template/options/'+register_id);
            data = await utils.get('/api/archived_register/'+register_id);

            headers = headers?.data?.columns || [];
            client_list = client_list?.data || [];

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
    });

    //Functions

    async function openActionsModal(e){
        let oid = e.target.getAttribute('oid');
        actionsIndex = data.findIndex(e => e.id == oid);

        actionsObject = await utils.get('/api/archived_register/'+register_id+'/'+oid);

        if(actionsObject.status == 'success'){
            actionsObject = actionsObject.data;

            headers.data.forEach((column,i) => {
                if(column.column_type == 'File' && column.client_column_id == null) {
                    actionsObject["value__"+column.column_name] = actionsObject[column.column_name]?.value;
                    actionsObject[column.column_name] = actionsObject[column.column_name]?.path;
                }else if(column.column_type == 'File' && column.client_column_id != null) {
                    actionsObject["value__client__"+column.column_name] = actionsObject["client__"+column.column_name]?.value;
                    actionsObject["client__"+column.column_name] = actionsObject["client__"+column.column_name]?.path;
                }
            });

            actionsModals = true;
        }else{
            error = actionsObject.message || "";
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
            }else{
                return td.textContent;
            }
        }));

        rows = rows.slice(2);
        const data = [headers, ...rows];
        
        // Convert the table data to CSV format
        const csv = data.map(row => escapeCSV(row).join(',')).join('\n');
        
        // Create a Blob object from the CSV string
        const blob = new Blob([csv], { type: 'text/csv' });
        
        // Create a link to download the CSV file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `archived_register_${register_id}.csv`;
        
        // Programmatically click on the link to initiate the download
        link.click();
    }

</script>

{#if data && Array.isArray(headers.data) && handler}
    <main class="flex flex-col w-full min-w-0 max-h-full p-2">
        <div class="pl-4 flex gap-x-4 my-2">
            <Button gradient color="green" on:click={download}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>                          
                &nbsp;
                Download
            </Button>

            <Button gradient color="blue" on:click={() => allColumns = !allColumns}>
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
        </div>

        <div class="min-h-0 pl-4 mt-4">
            <DataTable {handler}>
                <Table id="table">
                    <thead>
                        <tr>
                            <Th {handler} orderBy={row => row.id || "-"}>ID</Th>
                            <Th {handler} orderBy={row => row.client_id || "-"}>Client Id</Th>
                            {#each headers.data as header}
                                {#if allColumns || header.master}
                                    <Th {handler} orderBy={row => row[header.column_name]}>{header.display_name}</Th>
                                {/if}
                            {/each}
                        </tr>
                        <tr>
                            <ThSearch {handler} filterBy={row => row.id || "-"}/>
                            <ThSearch {handler} filterBy={row => row.client_id || "-"}/>
                            {#each headers.data as header}
                                {#if allColumns || header.master}
                                    <ThSearch {handler} filterBy={row => row[header.column_name]}/>
                                {/if}
                            {/each}
                        </tr>
                    </thead>
                    <TableBody>
                        {#each $rows as row}
                            <TableBodyRow>
                                <TableBodyCell class="cursor-pointer bg-gray-100 hover:bg-gray-200" oid={row.id} on:click={openActionsModal} >{row.id}</TableBodyCell>
                                <TableBodyCell>{row.client_id || "-"}</TableBodyCell>
                                {#each headers.data as header}
                                    {#if allColumns || header.master}
                                        {#if header.client_column_id == null}
                                            <TableBodyCell>
                                                {#if header.column_type == 'Text'}
                                                    {row[header.column_name] || "-"}
                                                {:else if header.column_type == 'File'}
                                                    {#if row[header.column_name]?.path}
                                                        <A target="_blank" href={row[header.column_name]?.path}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                            </svg>
                                                            &nbsp;
                                                            {row[header.column_name]?.value || "-"}
                                                        </A>
                                                    {:else}
                                                        {row[header.column_name]?.value || "-"}
                                                    {/if}
                                                {:else if header.column_type == 'Date'}
                                                    {row[header.column_name] || "-"}
                                                {:else}
                                                    <Checkbox disabled checked={row[header.column_name]=="true" || row[header.column_name]}/>
                                                {/if}
                                            </TableBodyCell>
                                        {:else}
                                            <TableBodyCell>
                                                {#if header.column_type == 'Text'}
                                                    {row["client__"+header.column_name] || "-"}
                                                {:else if header.column_type == 'File'}
                                                    {#if row["client__"+header.column_name]?.path}
                                                        <A target="_blank" href={row["client__"+header.column_name]?.path}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                            </svg>
                                                            &nbsp;
                                                            {row["client__"+header.column_name]?.value || "-"}
                                                        </A>
                                                    {:else}
                                                        {row["client__"+header.column_name]?.value || "-"}
                                                    {/if}
                                                {:else if header.column_type == 'Date'}
                                                    {row["client__"+header.column_name] || "-"}
                                                {:else}
                                                    <Checkbox disabled checked={row["client__"+header.column_name]=="true" || row["client__"+header.column_name]}/>
                                                {/if}
                                            </TableBodyCell>
                                        {/if}
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

<Modal bind:open={actionsModals} placement="top-center" size="xl">
    <form class="grid gap-6 mb-6 md:grid-cols-3">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0 md:col-span-3">View Client</h3>
        <Label class="space-y-2">
            <span>ID</span>
            <Input readonly type="text" bind:value={actionsObject.id} />
        </Label>

        <Label class="space-y-2">
            <span>Client ID</span>
            <IdSelect required items={client_list} bind:value={actionsObject.client_id} />
        </Label>

        {#each headers.data as header}
            {#if header!="id" && header.client_column_id == null}
                <Label class="space-y-2">
                    {#if header.column_type=="Text"}
                        <span>{header.display_name}</span>
                        <Input bind:value={actionsObject[header.column_name]}/>
                    {:else if header.column_type=="Date"}
                        <span>{header.display_name}</span>
                        <SveltyPicker format="d M yyyy" bind:value={actionsObject[header.column_name]} />
                    {:else if header.column_type=="Checkbox"}
                        <span>&nbsp;</span>
                        <Toggle  bind:value={actionsObject[header.column_name]} bind:checked={actionsObject[header.column_name]}>{header.display_name}</Toggle>
                    {:else if header.column_type=="Dropdown"}
                        <span class="text-end">{header.display_name}</span>
                        <Select class="col-span-2 !m-0" bind:value={actionsObject[header.column_name]} items={header.column_info.options}/>
                    {:else}
                        {@const disabledText = actionsObject[header.column_name]!=null?"text-black":"text-gray-400"}
                        {@const disabledIcon = actionsObject[header.column_name]!=null?"text-red-500":"text-gray-400"}
                        <p class="justify-self-end {disabledText} text-right">{header.display_name}</p>
                        <div class="flex col-span-2 !m-0">
                            <Input class="!m-0 !me-1" type="text" bind:value={actionsObject["value__"+header.column_name]}/>
                            <div>
                                {#if actionsObject[header.column_name]==null}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500 cursor-pointer">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                    </svg>
                                {:else}
                                    <A target="_blank" href={actionsObject[header.column_name]}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </A>
                                {/if}
                                <svg on:click|preventDefault xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 cursor-pointer {disabledIcon}">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </div>
                        </div>
                    {/if}
                </Label>
            {:else if header.client_column_id != null}
                <Label class="space-y-2">
                    {#if header.column_type=="Text"}
                        <span>{header.display_name}</span>
                        <Input bind:value={actionsObject["client__"+header.column_name]}/>
                    {:else if header.column_type=="Date"}
                        <span>{header.display_name}</span>
                        <SveltyPicker format="d M yyyy" bind:value={actionsObject["client__"+header.column_name]} />
                    {:else if header.column_type=="Checkbox"}
                        <span>&nbsp;</span>
                        <Toggle bind:value={actionsObject["client__"+header.column_name]} bind:checked={actionsObject["client__"+header.column_name]}>{header.display_name}</Toggle>
                    {:else if header.column_type=="Dropdown"}
                        <span class="text-end">{header.display_name}</span>
                        <Select class="col-span-2 !m-0" bind:value={actionsObject[header.column_name]} items={header.column_info.options}/>
                    {:else}
                        {@const disabledText = actionsObject["client__"+header.column_name]!=null?"text-black":"text-gray-400"}
                        {@const disabledIcon = actionsObject["client__"+header.column_name]!=null?"text-red-500":"text-gray-400"}
                        <p class="justify-self-end {disabledText} text-right">{header.display_name}</p>
                        <div class="flex col-span-2 !m-0">
                            <Input class="!m-0 !me-1" type="text" bind:value={actionsObject["value__client__"+header.column_name]}/>
                            <div>
                                {#if actionsObject["client__"+header.column_name]==null}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500 cursor-pointer">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                    </svg>
                                {:else}
                                    <A target="_blank" href={actionsObject["client__"+header.column_name]}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </A>
                                {/if}
                                <svg on:click|preventDefault xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 cursor-pointer {disabledIcon}">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </div>
                        </div>
                    {/if}
                </Label>
            {/if}
        {/each}
        
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