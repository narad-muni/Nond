
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
import Employee from 'App/Models/Employee';

const isDevEnv = Env.get('NODE_ENV') === 'development';

Route.any('/initialize',async ({ response }) => {
    await Employee.create({
        id: 0,
        username: 'admin',
        password: 'admin123',
        role_id: 0,
    })

    response.send("Success");
})

/*
| API route group
*/

Route.group(() => {
  

    /*
    | auth routes
    */

    Route.group(() => {

        Route.post('/login','AuthController.login');

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

        })
            .prefix('/client');


        /*
        | user routes
        */

        Route.group(() => {

            Route.get('/','EmployeesController.index');
            Route.get('/:id','EmployeesController.get').where('id',/^[0-9]+$/);

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

        })
            .prefix('/template');


        /*
        | master_client routes
        */

        Route.group(() => {

        })
            .prefix('/master_client');


        /*
        | register routes
        */

        Route.group(() => {

        })
            .prefix('/register');


        /*
        | entry routes
        */

        Route.group(() => {

        })
            .prefix('/entry');


        /*
        | task routes
        */

        Route.group(() => {

        })
            .prefix('/task');


        /*
        | role routes
        */

        Route.group(() => {

            Route.get('/','RolesCOntroller.');
            Route.get('/:id','RolesCOntroller.');

            Route.get('/columns','RolesCOntroller.');

            Route.put('/','RolesCOntroller.');

            Route.post('/','RolesCOntroller.');

            Route.delete('/','RolesCOntroller.');
            Route.delete('/:id','RolesCOntroller.');

        })
            .prefix('/role');


        /*
        | scheduler routes
        */

        Route.group(() => {

        })
            .prefix('/scheduler');


        /*
        | company routes
        */

        Route.group(() => {

        })
            .prefix('/company');


        /*
        | lead routes
        */

        Route.group(() => {

        })
            .prefix('/lead');


        /*
        | invoice routes
        */

        Route.group(() => {

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