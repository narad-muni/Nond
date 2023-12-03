<script>
    import Router from 'svelte-spa-router'
    import { location } from 'svelte-spa-router'
    import {wrap} from 'svelte-spa-router/wrap'

    import utils from './utils'
    import { user } from './global/stores.js';

    import Home from './pages/Home.svelte'
    import NotFound from './pages/Error.svelte'
    import Login from './pages/Login.svelte';
    import License from './pages/License.svelte';

    let loaded = false;
    let routes;

    (async () => {
        const license = await utils.get('/api/open/license/is_license_valid');

        if(license.status){
            const resp = await utils.get('/api/auth/get_user');
            user.set(resp.data);
            if($user){
                if($location.startsWith('/login')){
                    window.location.href = '/#/';
                }
            }else if(!$location.startsWith('/login') && !$location.startsWith('/404') && !$location.startsWith('/license')){
                window.location.href = '/#/login';
            }
        }else{
            window.location.href = '/#/license';
        }

        routes = {
            // Exact path
            '/license': wrap({
                component: License
            }),
            '/login':wrap({
                component: Login,
                conditions: [
                    (details) => !$user && license.status
                ]
            }),
            '/': wrap({
                component: Home,
                conditions: [
                    (details) => $user && license.status
                ]
            }),
            '/*': wrap({
                component: Home,
                conditions: [
                    (details) => $user && license.status
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