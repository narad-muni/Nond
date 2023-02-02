<script>
  import Router from "svelte-spa-router";
  import Sidebar from "../component/Sidebar.svelte";
  import Clients from "./Clients.svelte";
  import Dashboard from "./Dashboard.svelte";
  import Error from "./Error.svelte";

  let routes = {
    '/': Dashboard,
    '/clients':Clients,
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
  