<script>
    import { Button, Alert } from 'flowbite-svelte';
    import utils from '../utils'
    import { user } from '../global/stores.js';

    let error="", license={}, license_file;

    (async () => {
        license = await utils.get('/api/open/license/license');
    })();

    async function uploadLicense(){
        const resp = await utils.post_form('/api/open/license/update_license',utils.getFormData({"license":license_file}));
        
        if(resp.status == "success"){
            window.location.reload();
        }else{
            error = resp.message;
        }

    }

</script>

<main>
    <section class="bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img class="w-8 h-8 mr-2" src="logo.png" alt="logo">
                Nond  
            </a>
            <div class="w-full flex justify-center">
                <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 class="text-xl font-bold text-center leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Upload License
                        </h1>
                        <form class="space-y-4 md:space-y-6" on:submit|preventDefault={uploadLicense}>
                            <div>
                                <input required type="file" accept="*" on:input={event => license_file=event.target.files[0]} class="col-span-2 w-full border border-gray-300 rounded-lg cursor-pointer !m-0" />
                            </div>
                            <Button type="submit" gradient class="w-full">Upload</Button>
                        </form>
                    </div>
                </div>
                <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">

                        {#if license.status}
                            <h1 class="text-lg text-green-500 font-bold text-center leading-tight tracking-tight text-gray-900 dark:text-white">
                                License Status : {license.message}
                            </h1>
                        {:else}
                            <h1 class="text-lg text-red-500 font-bold text-center leading-tight tracking-tight text-gray-900 dark:text-white">
                                License Status : {license.message}
                            </h1>
                        {/if}
                        <div>
                            <p>Subscription : {license?.data?.subscription || "-"}</p>
                            <p>Expires On : {new Date((license?.data?.expiry || 0)*1000).toDateString()}</p>
                            <p>Users : {license?.data?.users || "-"}</p>
                            <p>Unique Id : {license?.data?.machine || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

{#if error.length > 0}
    <div class="flex fixed left-0 right-0 top-0 z-50 bg-black/50 w-full h-full backdrop-opacity-25">
        <Alert class="mx-auto mt-4 h-fit" color="red" dismissable on:close={()=>error=""}>
            <span slot="icon"><svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            </span>
            <span class="font-medium">Error!</span> {error}
        </Alert>
    </div>
{/if}