<script>
    import Router from "svelte-spa-router";
    import Clients from "./Clients.svelte";
    import Dashboard from "./Dashboard.svelte";
    import Error from "./Error.svelte";
    import Users from "./Users.svelte";

    import { location } from 'svelte-spa-router'

    import {user} from '../global/user.js'
    import Role from "./Role.svelte";
    import Lead from "./Lead.svelte";
    import Task from "./Task.svelte";
    import MasterTemplate from "./MasterTemplate.svelte";
    import TaskTemplate from "./TaskTemplate.svelte";
    import Company from "./Company.svelte";
    import DeletedClients from "./DeletedClients.svelte";
    import Navbar from "../component/Navbar.svelte";
    import Service from "./Service.svelte";
    import RegisterMaster from "./RegisterMaster.svelte";
    import Invoice from "./Invoice.svelte";

    if($location == '/'){
        if(!$user.is_admin){
            window.location.href ='/#/task';
        }
    }

    let routes = {
        '/': Dashboard,
        '/client':Clients,
        '/company':Company,
        '/service':Service,
        '/role':Role,
        '/register_master':RegisterMaster,
        '/lead':Lead,
        '/employee':Users,
        '/task':Task,
        '/invoice':Invoice,
        '/master_template':MasterTemplate,
        '/task_template':TaskTemplate,
        '/deleted/client':DeletedClients,
        '*':Error
    }

</script>

<main class="flex max-h-[100vh] flex-col">
    <div>
        <Navbar/>
    </div>
    <Router {routes}/>
</main>

<style>

</style>
  