<script>
    import Router from 'svelte-spa-router'
    import { location } from 'svelte-spa-router'
    import {wrap} from 'svelte-spa-router/wrap'

    import utils from './utils'
    import { user } from './global/user.js';

    import Home from './pages/Home.svelte'
    import NotFound from './pages/Error.svelte'
    import Login from './pages/Login.svelte';
    import Error from './pages/Error.svelte';

    let loaded = false;
    let routes;

    (async ()=>{
        const resp = await utils.get('/api/auth/get_user');
        user.set(resp.data)

        if($user){
            if($location.startsWith('/login')){
                window.location.href = '/#/';
            }
        }else if(!$location.startsWith('/login') || !$location.startsWith('/404')){
            window.location.href = '/#/login';
        }

        routes = {
            // Exact path
            '/login':wrap({
                component: Login,
                conditions: [
                    (details) => !$user
                ]
            }),
            '/': wrap({
                component: Home,
                conditions: [
                    (details) => $user
                ]
            }),
            '/*': wrap({
                component: Home,
                conditions: [
                    (details) => $user
                ]
            }),
            '*': NotFound,
        }

        loaded = true;
    })()

</script>

<body class="min-h-[100vh]">
    {#if loaded}
        <Router {routes}/>
    {/if}
</body>