import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Acl {
    public async handle({request,response,session}: HttpContextContract, next: () => Promise<void>) {
        let req_url = request.url();
        if(!req_url.endsWith('/')){
            req_url += '/'
        }

        const prefix_index = req_url.indexOf('/',2);
        const url = req_url.substring(prefix_index+1);
        const part = url.substring(0,url.indexOf('/'));
        const method = request.method()
        const role = session.get('user').role;
        const not_permitted_err = {
            status: 'error',
            message: 'Permission denied'
        }

        if(method == 'GET' && url.includes('options')){
            await next();
            return;
        }

        if(method == 'GET'){// Read Operation

            if(!role.read[part]){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'POST'){// Create Operation

            if(!role.create[part]){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'PUT'){// Update Operation

            if(!role.update[part]){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'DELETE'){// Delete Operation

            if(url.includes('destroy')){
                if(!role.destroy[part]){
                    response.send(not_permitted_err);
                    return;
                }
            }else{
                if(!role.remove[part]){
                    response.send(not_permitted_err);
                    return;
                }
            }
            
        }

        // If none of these matches, then continue the request
        await next()
    
    }
}
