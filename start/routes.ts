
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

/*
| API route group
*/

Route.get('/file/*','FilesController.get')
.middleware('auth')
.middleware('acl');

Route.group(() => {
  

    /*
    | auth routes
    */

    Route.group(() => {

        Route.post('/login','AuthController.login');
        Route.post('/logout','AuthController.logout');
        Route.get('/is_logged_in','AuthController.isLoggedIn');
        Route.get('/get_user','AuthController.user');

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
            Route.get('/:id','ClientsController.get').where('id',/^[0-9]+$/);

            Route.get('/master/','ClientsController.indexMaster');

            Route.get('/options','ClientsController.options');

            Route.get('/columns','ClientsController.columns');

            Route.post('/','ClientsController.create');

            Route.put('/','ClientsController.update');

            Route.delete('/','ClientsController.remove');
            Route.delete('/:id','ClientsController.remove').where('id',/^[0-9]+$/);

            Route.delete('/destroy/','ClientsController.destroy');
            Route.delete('/destroy/:id','ClientsController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/client');


        /*
        | user routes
        */

        Route.group(() => {

            Route.get('/','EmployeesController.index');
            Route.get('/:id','EmployeesController.get').where('id',/^[0-9]+$/);

            Route.get('/columns','EmployeesController.columns');

            Route.get('/options','EmployeesController.options');

            Route.put('/','EmployeesController.update');

            Route.post('/','EmployeesController.create');

            Route.delete('/','EmployeesController.remove');
            Route.delete('/:id','EmployeesController.remove').where('id',/^[0-9]+$/);

            Route.group(() => {
                Route.get('/','EmployeesController.index_deleted');

                Route.delete('/','EmployeesController.destroy');
                Route.delete('/:id','EmployeesController.destroy').where('id',/^[0-9]+$/);
            })
            .prefix('/deleted')

        })
        .prefix('/employee');


        /*
        | template routes
        */

        Route.group(() => {
            Route.get('/','TemplatesController.index');
            Route.get('/:id','TemplatesController.get').where('id',/^[0-9]+$/);

            Route.post('/','TemplatesController.create');

            Route.put('/','TemplatesController.update');

            Route.delete('/','TemplatesController.destroy');
            Route.delete('/:id','TemplatesController.destroy').where('id',/^[0-9]+$/);
        })
        .prefix('/template');


        /*
        | master_client routes
        */

        Route.group(() => {
            Route.get('/','MasterTemplatesController.index');
            Route.get('/:id','MasterTemplatesController.get').where('id',/^[0-9]+$/);

            Route.post('/','MasterTemplatesController.create');

            Route.put('/','MasterTemplatesController.update');

            Route.delete('/','MasterTemplatesController.destroy');
            Route.delete('/:id','MasterTemplatesController.destroy').where('id',/^[0-9]+$/);
        })
        .prefix('/master_template');


        /*
        | register routes
        */

        Route.group(() => {

            Route.get('/','RegistersController.index');
            Route.get('/:id','RegistersController.get').where('id',/^[0-9]+$/);

            Route.put('/','RegistersController.update');

            Route.delete('/','RegistersController.destroy');
            Route.delete('/:id','RegistersController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/register');


        /*
        | entry routes
        | TODO: add template and register id in routes
        */

        Route.group(() => {

            Route.get('/','EntriesController.index');
            Route.get('/:id','EntriesController.get').where('id',/^[0-9]+$/);

            Route.get('/master/','EntriesController.indexMaster');

            Route.get('/columns/:template_id','EntriesController.columns');

            Route.post('/','EntriesController.create');

            Route.put('/','EntriesController.update');

            Route.delete('/','EntriesController.destroy');
            Route.delete('/:id','EntriesController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/entry');


        /*
        | task routes
        */

        Route.group(() => {

            Route.get('/','TasksController.index');
            Route.get('/:id','TasksController.get').where('id',/^[0-9]+$/);

            Route.post('/','TasksController.create');

            Route.put('/','TasksController.update');

            Route.delete('/','TasksController.destroy');
            Route.delete('/:id','TasksController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/task');


        /*
        | role routes
        */

        Route.group(() => {

            Route.get('/','RolesController.');
            Route.get('/:id','RolesController.').where('id',/^[0-9]+$/);
            Route.get('/options','RolesController.options');

            Route.put('/','RolesController.');

            Route.post('/','RolesController.');

            Route.delete('/','RolesController.');
            Route.delete('/:id','RolesController.').where('id',/^[0-9]+$/);

        })
        .prefix('/role');


        /*
        | scheduler routes
        */

        Route.group(() => {

            Route.get('/','SchedulersController.index');
            Route.get('/:id','SchedulersController.get').where('id',/^[0-9]+$/);

            Route.post('/','SchedulersController.create');

            Route.put('/','SchedulersController.update');

            Route.delete('/','SchedulersController.destroy');
            Route.delete('/:id','SchedulersController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/scheduler');


        /*
        | company routes
        */

        Route.group(() => {
            
            Route.get('/','CompaniesController.index');
            Route.get('/:id','CompaniesController.get').where('id',/^[0-9]+$/);
            Route.get('/options','CompaniesController.options');

            Route.get('/columns','CompaniesController.columns');

            Route.post('/','CompaniesController.create');

            Route.put('/','CompaniesController.update');

            Route.delete('/','CompaniesController.destroy');
            Route.delete('/:id','CompaniesController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/company');


        /*
        | lead routes
        */

        Route.group(() => {

            Route.get('/','LeadsController.index');
            Route.get('/:id','LeadsController.get').where('id',/^[0-9]+$/);

            Route.post('/','LeadsController.create');

            Route.put('/','LeadsController.update');

            Route.delete('/','LeadsController.destroy');
            Route.delete('/:id','LeadsController.destroy').where('id',/^[0-9]+$/);

        })
        .prefix('/lead');


        /*
        | invoice routes
        */

        Route.group(() => {

            Route.get('/','InvoicesController.index');
            Route.get('/:id','InvoicesController.get').where('id',/^[0-9]+$/);

            Route.post('/','InvoicesController.create');

            Route.put('/','InvoicesController.update');

            Route.delete('/','InvoicesController.destroy');
            Route.delete('/:id','InvoicesController.destroy').where('id',/^[0-9]+$/);

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