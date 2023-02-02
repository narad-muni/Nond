<script>
    import { Input, Label, Button, FloatingLabelInput } from 'flowbite-svelte';
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
                    <form class="space-y-4 md:space-y-6" on:submit|preventDefault>
                        <div>
                            <FloatingLabelInput style="outlined" type="text" label="Username" />
                        </div>
                        <div>
                            <FloatingLabelInput style="outlined" type="password" label="Password" />
                        </div>
                        <Button gradient class="w-full">Sign In</Button>
                    </form>
                </div>
            </div>
        </div>
    </section>
</main>