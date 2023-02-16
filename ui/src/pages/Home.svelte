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
  import Role from "./Role.svelte";
  import Lead from "./Lead.svelte";
  import Task from "./Task.svelte";
  import MasterTemplate from "./MasterTemplate.svelte";
  import Company from "./Company.svelte";
  import DeletedClients from "./DeletedClients.svelte";

    if($location == '/'){
        if(!$user.is_admin){
            window.location.href ='/#/users';
        }
    }

    let routes = {
        '/': Dashboard,
        '/client':Clients,
        '/company':Company,
        '/role':Role,
        '/lead':Lead,
        '/employee':Users,
        '/task':Task,
        '/master_template':MasterTemplate,
        '/deleted/clients':DeletedClients,
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
  