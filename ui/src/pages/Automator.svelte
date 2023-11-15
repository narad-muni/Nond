<script>
    import { onMount ,onDestroy } from 'svelte';
    import utils from "../utils";
    import { user } from '../global/stores';
  import { Accordion, AccordionItem, Alert, Button, Card } from 'flowbite-svelte';
  import Invoice from './Invoice.svelte';
    
    let automators = [], error = "";

    async function refresh_status(){
        automators = await utils.get("/api/automator");
        if(automators.status == 'success'){
            automators = automators.data;
        }else{
            error = automators.message;
            automators = [];
        }
    }

    async function deleteAutomatorLog(id){
        await utils._delete(`/api/automator/${id}`);
        await refresh_status();
    }

    onMount(async () => {
        await refresh_status();
    });

</script>

<div class="mt-5 mx-5">
    {#each automators as automator}
        <Card>
            <p>{automator.name}</p>
            <p>{automator.message}</p>
            <p>{automator.status}</p>
            <p>{automator.created_on}</p>
            <Button color="red" on:click={() => deleteAutomatorLog(automator.id)}>Delete</Button>
            <Accordion>
                <AccordionItem>
                    <span slot="header">Logs</span>
                    {#each Object.entries(automator.data) as [invoice, data]}
                        {#if invoice != 'temp_invoice_path'}
                            {#if data.success == true}
                                <p class="text-green-500">{invoice} - {data.message}</p>
                            {:else}
                                <p class="text-red-500">{invoice} - {data.message}</p>
                            {/if}
                        {/if}
                    {/each}
                </AccordionItem>
            </Accordion>
        </Card>
    {/each}
</div>

{#if error.length > 0}
    <div class="flex fixed left-0 right-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}