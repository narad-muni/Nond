
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
import GlobalState from 'App/Utils/GlobalState';

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
        Route.any('/logout','AuthController.logout');
        Route.get('/is_logged_in','AuthController.isLoggedIn');
        Route.get('/get_user','AuthController.user');

    })
    .prefix('/auth');

    //dashboard routes
    Route.group(() => {

        Route.any('/stats','DashboardController.getStats');

    })
    .middleware('auth')
    .prefix('/dashboard');

    /*
    | Auth and role protected clients
    */

    Route.group(() => {

        /*
        | client routes
        */

        Route.group(() => {
            
            Route.get('/:deleted?','ClientsController.index')
                .where('deleted',/true|false/);

            Route.get('/master/:deleted','ClientsController.indexMaster')
                .where('deleted',/true|false/);

            Route.get('/:id','ClientsController.get')
                .where('id',/^-?\d+$/);

            Route.get('/options','ClientsController.options');

            Route.get('/columns','ClientsController.columns');

            Route.post('/','ClientsController.create');

            Route.put('/bulk_service_update','ClientsController.bulkServiceUpdate');

            Route.post('/restore','ClientsController.restore');

            Route.put('/','ClientsController.update');

            Route.delete('/','ClientsController.remove');

            Route.delete('/destroy','ClientsController.destroy');

        })
        .prefix('/client');

        /*
        | user routes
        */

        Route.group(() => {

            Route.get('/:deleted?','EmployeesController.index')
                .where('deleted',/true|false/);

            Route.get('/:id','EmployeesController.get')
                .where('id',/^-?\d+$/);

            Route.get('/options','EmployeesController.options');

            Route.put('/','EmployeesController.update');

            Route.post('/','EmployeesController.create');

            Route.post('/restore','EmployeesController.restore');

            Route.delete('/','EmployeesController.remove');

            Route.delete('/destroy','EmployeesController.destroy');

        })
        .prefix('/employee');

        /*
        | template routes
        */

        Route.group(() => {
            Route.get('/:table_id','RegisterTemplatesController.index')
                .where('table_id',/^-?\d+$/);
            
            Route.get('/:table_id/:id','RegisterTemplatesController.get')
                .where('id',/^-?\d+$/)
                .where('table_id',/^-?\d+$/);

            Route.get('/options/:table_id','RegisterTemplatesController.options')
                .where('table_id',/^-?\d+$/);
        
            Route.post('/','RegisterTemplatesController.create');

            Route.put('/','RegisterTemplatesController.update');

            Route.put('/set_order','RegisterTemplatesController.set_order');

            Route.delete('/destroy','RegisterTemplatesController.destroy');
        })
        .prefix('/register_template');


        /*
        | master_client routes
        */

        Route.group(() => {
            Route.get('/','MasterTemplatesController.index');
            Route.get('/options/client','MasterTemplatesController.client_options');
            Route.get('/options/:table_name','MasterTemplatesController.index_options');
            Route.get('/:id','MasterTemplatesController.get')
                .where('id',/^-?\d+$/);

            Route.post('/','MasterTemplatesController.create');

            Route.put('/','MasterTemplatesController.update');
            Route.put('/set_order','MasterTemplatesController.set_order');

            Route.delete('/destroy','MasterTemplatesController.destroy');
        })
        .prefix('/master_template');


        /*
        | register routes
        */

        Route.group(() => {

            Route.get('/','RegisterMasterController.index');
            Route.get('/:id','RegisterMasterController.get').where('id',/^-?\d+$/);

            Route.get('/options/:filter?','RegisterMasterController.options').where('filter',/all|active|archived/);

            Route.post('/','RegisterMasterController.create');

            Route.put('/archive','RegisterMasterController.archive');

            Route.put('/','RegisterMasterController.update');

            Route.delete('/destroy','RegisterMasterController.destroy');

        })
        .prefix('/register_master');

        Route.group(() => {

            Route.get('/:table_id','RegistersController.index')
                .where('table_id',/^-?\d+$/);

            Route.get('/master/:table_id','RegistersController.indexMaster')
                .where('table_id',/^-?\d+$/);

            Route.get('/:table_id/:id','RegistersController.get')
                .where('id',/^-?\d+$/)
                .where('table_id',/^-?\d+$/);

            Route.post('/:table_id','RegistersController.create')
                .where('table_id',/^-?\d+$/);

            Route.put('/:table_id','RegistersController.update')
                .where('table_id',/^-?\d+$/);

            Route.delete('/destroy/:table_id','RegistersController.destroy')
                .where('table_id',/^-?\d+$/);

        })
        .prefix('/register');

        Route.group(() => {

            Route.get('/:table_id','ArchivedRegistersController.index')
                .where('table_id',/^-?\d+$/);
                
            Route.get('/:table_id/:id','ArchivedRegistersController.get')
                .where('id',/^-?\d+$/)
                .where('table_id',/^-?\d+$/);

        })
        .prefix('/archived_register');


        /*
        | task routes
        */

        Route.group(() => {

            Route.get('/','TasksController.index');
            Route.get('/:status/:billed/:self','TasksController.index')
                .where('status',/^[0-2]$/)
                .where('billed',/^[0-2]$/)
                .where('self',/^(?:true|false)$/);
            
            Route.get('/:id','TasksController.get')
                .where('id',/^-?\d+$/);

            Route.post('/','TasksController.create');

            Route.put('/','TasksController.update');
            Route.put('/bulk','TasksController.bulk_update');

            Route.put('/bill','TasksController.bill');

            Route.delete('/destroy','TasksController.destroy');

        })
        .prefix('/task');

        Route.group(() => {

            Route.get('/','ArchivedTasksController.index');
            Route.get('/:self','ArchivedTasksController.index')
                .where('status',/^[0-2]$/)
                .where('billed',/^[0-2]$/)
                .where('self',/^(?:true|false)$/);
            
            Route.get('/:id','ArchivedTasksController.get')
                .where('id',/^-?\d+$/);

        })
        .prefix('/task/archived');

        Route.group(() => {
            Route.get('/','AutomatorsController.index');
            Route.get('/:id','AutomatorsController.get');
            Route.delete('/destroy/:id','AutomatorsController.destroy');
        })
        .prefix('/automator');

        /*
        | task_template routes
        */

        Route.group(() => {

            Route.get('/','TaskTemplatesController.index');
            Route.get('/:id','TaskTemplatesController.get')
                .where('id',/^-?\d+$/);

            Route.get('/options','TaskTemplatesController.options');

            Route.post('/','TaskTemplatesController.create');

            Route.put('/','TaskTemplatesController.update');

            Route.delete('/destroy','TaskTemplatesController.destroy');

        })
        .prefix('/task_template');

        Route.group(() => {

            Route.get('/','ReportsController.index');
            Route.get('/:report_name','ReportsController.load');

        })
        .prefix('/report');


        /*
        | role routes
        */

        Route.group(() => {

            Route.get('/','RolesController.index');
            Route.get('/:id','RolesController.get')
                .where('id',/^-?\d+$/);
            Route.get('/options','RolesController.options');

            Route.put('/','RolesController.update');

            Route.post('/','RolesController.create');

            Route.delete('/destroy','RolesController.destroy');

        })
        .prefix('/role');

        /*
        | service routes
        */

        Route.group(() => {

            Route.get('/','ServicesController.index');

            Route.get('/:id','ServicesController.get')
                .where('id',/^-?[0-9]+$/);

            Route.get('/options/:all?','ServicesController.options')
                .where('al',/true|false/);

            Route.get('/options_gst/:hsn','ServicesController.options_gst')
                .where('id',/^-?[0-9]+$/);

            Route.get('/options_all','ServicesController.options_all');

            Route.put('/','ServicesController.update');

            Route.post('/','ServicesController.create');

            Route.delete('/destroy','ServicesController.destroy');

        })
        .prefix('/service');


        /*
        | company routes
        */

        Route.group(() => {
            
            Route.get('/:deleted?','CompaniesController.index')
                .where('deleted',/true|false/);
                
            Route.get('/:id','CompaniesController.get')
                .where('id',/^-?\d+$/);

            Route.get('/master/:deleted?','CompaniesController.indexMaster');

            Route.get('/options','CompaniesController.options');

            Route.get('/columns','CompaniesController.columns');

            Route.post('/','CompaniesController.create');

            Route.post('/restore','CompaniesController.restore');

            Route.put('/','CompaniesController.update');

            Route.delete('/','CompaniesController.remove');

            Route.delete('/destroy/','CompaniesController.destroy');

        })
        .prefix('/company');


        /*
        | lead routes
        */

        Route.group(() => {

            Route.get('/','LeadsController.index');
            Route.get('/:id','LeadsController.get')
                .where('id',/^-?\d+$/);

            Route.post('/','LeadsController.create');

            Route.put('/','LeadsController.update');

            Route.delete('/destroy','LeadsController.destroy');

        })
        .prefix('/lead');


        /*
        | invoice routes
        */

        Route.group(() => {

            Route.get('/','InvoicesFilesController.download');
            
            Route.get('/filter/:filter','InvoicesController.index');

            Route.get('/:id','InvoicesController.get');

            Route.post('/','InvoicesController.create');
            Route.post('/send_mail','InvoiceMailsController.sendMail');

            Route.put('/','InvoicesController.update');

            Route.delete('/destroy','InvoicesController.destroy');

        })
        .prefix('/invoice');

        Route.group(() => {

            Route.get('/filter/:filter','ArchivedInvoicesController.index');

            Route.get('/:id','ArchivedInvoicesController.get');

        })
        .prefix('/invoice/archived');

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
    });

})
.middleware('validate_license')
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