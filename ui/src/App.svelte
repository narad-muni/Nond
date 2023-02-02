<script>
  import Home from './pages/Home.svelte'
  import NotFound from './pages/Error.svelte'
  import Router from 'svelte-spa-router'
  import Login from './pages/Login.svelte';

  const routes = {
      // Exact path
      '/login':Login,
      '/404': NotFound,
      '/': Home,
      '/*': Home,
      '*': NotFound,
  }
</script>

<body>
  <Router {routes}/>
</body>