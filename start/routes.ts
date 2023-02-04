
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route';
import Env from '@ioc:Adonis/Core/Env';
import path from 'path';
import loadAssets from 'App/Utils/loadAssets';


const isDevEnv = Env.get('NODE_ENV') === 'development';

Route.any('/init','InitializersController.initialize');

Route.any('/deinit','InitializersController.de_initialize');

/*
| API route group
*/

Route.group(() => {
  

    /*
    | auth routes
    */

    Route.group(() => {

        Route.post('/login','AuthController.login');
        Route.post('/logout','AuthController.logout');
        Route.get('/is_logged_in','AuthController.isLoggedIn');

    })
    .prefix('/auth');

    /*
    | Auth and role protected clients
    */

    Route.group(() => {

        /*
        | client routes
        */

        Route.group(() => {
            Route.get('/','ClientsController.index');
            Route.get('/:id','ClientsController.get')
            Route.get('/as_options/:id','ClientsController.get');

            Route.get('/columns','ClientsController.columns');

            Route.post('/','ClientsController.create');

            Route.put('/','ClientsController.update');

            Route.delete('/','ClientsController.destroy');
            Route.delete('/:id','ClientsController.destroy');
        })
        .prefix('/client');


        /*
        | user routes
        */

        Route.group(() => {

            Route.get('/','EmployeesController.index');
            Route.get('/:id','EmployeesController.get');
            Route.get('/as_options/:id','EmployeesController.columns');

            Route.get('/columns','EmployeesController.columns');

            Route.put('/','EmployeesController.update');

            Route.post('/','EmployeesController.create');

            Route.delete('/','EmployeesController.remove');
            Route.delete('/:id','EmployeesController.remove');

            Route.delete('/destroy/','EmployeesController.destroy');
            Route.delete('/destroy/:id','EmployeesController.destroy');

        })
        .prefix('/employee');


        /*
        | template routes
        */

        Route.group(() => {
            Route.get('/','TemplatesController.index');
            Route.get('/:id','TemplatesController.get')
            Route.get('/as_options/:id','TemplatesController.get');

            Route.get('/columns','TemplatesController.columns');

            Route.post('/','TemplatesController.create');

            Route.put('/','TemplatesController.update');

            Route.delete('/','TemplatesController.destroy');
            Route.delete('/:id','TemplatesController.destroy');
        })
        .prefix('/template');


        /*
        | master_client routes
        */

        Route.group(() => {
            Route.get('/','MasterTemplatesController.index');
            Route.get('/:id','MasterTemplatesController.get')
            Route.get('/as_options/:id','MasterTemplatesController.get');

            Route.get('/columns','MasterTemplatesController.columns');

            Route.post('/','MasterTemplatesController.create');

            Route.put('/','MasterTemplatesController.update');

            Route.delete('/','MasterTemplatesController.destroy');
            Route.delete('/:id','MasterTemplatesController.destroy');
        })
        .prefix('/master_template');


        /*
        | register routes
        */

        Route.group(() => {
            Route.get('/','RegistersController.index');
            Route.get('/:id','RegistersController.get')
            Route.get('/as_options/:id','RegistersController.get');

            Route.get('/columns','RegistersController.columns');

            Route.post('/','RegistersController.create');

            Route.put('/','RegistersController.update');

            Route.delete('/','RegistersController.destroy');
            Route.delete('/:id','RegistersController.destroy');
        })
        .prefix('/register');


        /*
        | entry routes
        */

        Route.group(() => {
            Route.get('/','CompaniesController.index');
            Route.get('/:id','CompaniesController.get')
            Route.get('/as_options/:id','CompaniesController.get');

            Route.get('/columns','CompaniesController.columns');

            Route.post('/','CompaniesController.create');

            Route.put('/','CompaniesController.update');

            Route.delete('/','CompaniesController.destroy');
            Route.delete('/:id','CompaniesController.destroy');
        })
        .prefix('/entry');


        /*
        | task routes
        */

        Route.group(() => {
            Route.get('/','TasksController.index');
            Route.get('/:id','TasksController.get')
            Route.get('/as_options/:id','TasksController.get');

            Route.get('/columns','TasksController.columns');

            Route.post('/','TasksController.create');

            Route.put('/','TasksController.update');

            Route.delete('/','TasksController.destroy');
            Route.delete('/:id','TasksController.destroy');
        })
        .prefix('/task');


        /*
        | role routes
        */

        Route.group(() => {

            Route.get('/','RolesController.');
            Route.get('/:id','RolesController.');

            Route.get('/columns','RolesController.');

            Route.put('/','RolesController.');

            Route.post('/','RolesController.');

            Route.delete('/','RolesController.');
            Route.delete('/:id','RolesController.');

        })
        .prefix('/role');


        /*
        | scheduler routes
        */

        Route.group(() => {
            Route.get('/','SchedulersController.index');
            Route.get('/:id','SchedulersController.get')
            Route.get('/as_options/:id','SchedulersController.get');

            Route.get('/columns','SchedulersController.columns');

            Route.post('/','SchedulersController.create');

            Route.put('/','SchedulersController.update');

            Route.delete('/','SchedulersController.destroy');
            Route.delete('/:id','SchedulersController.destroy');
        })
        .prefix('/scheduler');


        /*
        | company routes
        */

        Route.group(() => {
            
            Route.get('/','CompaniesController.index');
            Route.get('/:id','CompaniesController.get')
            Route.get('/as_options/:id','CompaniesController.get');

            Route.get('/columns','CompaniesController.columns');

            Route.post('/','CompaniesController.create');

            Route.put('/','CompaniesController.update');

            Route.delete('/','CompaniesController.destroy');
            Route.delete('/:id','CompaniesController.destroy');

        })
        .prefix('/company');


        /*
        | lead routes
        */

        Route.group(() => {
            Route.get('/','LeadsController.index');
            Route.get('/:id','LeadsController.get')
            Route.get('/as_options/:id','LeadsController.get');

            Route.get('/columns','LeadsController.columns');

            Route.post('/','LeadsController.create');

            Route.put('/','LeadsController.update');

            Route.delete('/','LeadsController.destroy');
            Route.delete('/:id','LeadsController.destroy');
        })
        .prefix('/lead');


        /*
        | invoice routes
        */

        Route.group(() => {
            Route.get('/','InvoicesController.index');
            Route.get('/:id','InvoicesController.get')
            Route.get('/as_options/:id','InvoicesController.get');

            Route.get('/columns','InvoicesController.columns');

            Route.post('/','InvoicesController.create');

            Route.put('/','InvoicesController.update');

            Route.delete('/','InvoicesController.destroy');
            Route.delete('/:id','InvoicesController.destroy');
        })
        .prefix('/invoice');

    })
    .middleware('auth')
    .middleware('acl');

    /*
    | Handle Invalid API Routes
    */

    Route.any('*',({ response }) => {
        response.send({
            'status': 'error',
            'message': 'Invalid API endpoint'
        });
    })

})
.prefix('/api');

// Serve vite resources on dev mode
if (isDevEnv) {
    Route.get('/src/*', async ({ request, response }) => {
        const file = path.resolve(`./ui/${request.url()}`);
        response.attachment(file, path.basename(file), 'inline');
    });
}


/*
| Redirect all routes to index page, spa
*/

Route.get('/', async ({ view }) => {
    const assetsData = await loadAssets();
    return view.render('index', {
        isDev: !assetsData.found && isDevEnv,
        assetsData,
    });
});

/*
|
| Below is to handle invalid page and api
|
*/

Route.get('*', ({ response }) => {
    response.redirect().toPath('/#/404');
});

Route.route('*',['POST','PUT','DELETE'], ({ response }) => {
    response.send({
        'status': 'error',
        'message': 'Invalid url'
    })
});