<script>
    import Router from "svelte-spa-router";
    import Sidebar from "../component/Sidebar.svelte";
    import Clients from "./Clients.svelte";
    import Dashboard from "./Dashboard.svelte";
    import Error from "./Error.svelte";
    import Users from "./Users.svelte";

    import { location } from 'svelte-spa-router'
    import {wrap} from 'svelte-spa-router/wrap'

    import {user} from '../global/user.js'

    if($location == '/'){
        if(!$user.is_admin){
            window.location.href ='/#/users';
        }
    }

    let routes = {
        '/': Dashboard,
        '/clients':Clients,
        '/users':Users,
        '*':Error
    }

</script>

<main class="flex max-h-[100vh]">
    <div>
        <Sidebar></Sidebar>
    </div>
    <Router {routes}/>
</main>

<style>

</style>
  