<script>
    import { Input, Label, Button, FloatingLabelInput,Alert } from 'flowbite-svelte';
    import utils from '../utils'
    import { user } from '../global/user.js';

    let username,password,error="";

    async function login(){

        if(username?.length < 3){
            error="Username should be 3 or more characters long";
        }else if(password?.length < 8){
            error="Password should be 8 or more characters long";
        }else{
            const data = {
                username: username,
                password: password
            }
            const resp = await utils.post_json('/api/auth/login',data);
            
            if(resp.status == 'success'){
                user.set(resp.data);
                window.location.href = '/'
            }else{
                error = resp.message;
            }
        }

    }

</script>

<main>
    <section class="bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img class="w-8 h-8 mr-2" src="logo.png" alt="logo">
                Nond  
            </a>
            <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold text-center leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Sign in
                    </h1>
                    <form class="space-y-4 md:space-y-6" on:submit|preventDefault={login}>
                        <div>
                            <FloatingLabelInput required bind:value={username} style="outlined" type="text" label="Username" />
                        </div>
                        <div>
                            <FloatingLabelInput required bind:value={password} style="outlined" type="password" label="Password" />
                        </div>
                        <Button type="submit" gradient class="w-full">Sign In</Button>
                    </form>
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