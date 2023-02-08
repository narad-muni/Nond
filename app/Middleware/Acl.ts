import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Acl {
    public async handle({request,response,session}: HttpContextContract, next: () => Promise<void>) {
        const prefix_index = request.url().indexOf('/',2);
        const url = request.url().substring(prefix_index+1);
        const part = url.substring(0,url.indexOf('/'));
        const method = request.method()
        const role = session.get('user').role;
        const not_permitted_err = {
            status: 'error',
            message: 'Permission denied'
        }

        if(method == 'GET'){// Read Operation

            if(!role.read.includes(part)){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'POST'){// Create Operation

            if(!role.create.includes(part)){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'PUT'){// Update Operation

            if(!role.update.includes(part)){
                response.send(not_permitted_err);
                return;
            }

        }else if(method == 'DELETE'){// Delete Operation

            if(part.includes('destroy')){
                if(!role.destroy.includes(part)){
                    response.send(not_permitted_err);
                    return;
                }
            }else{
                if(!role.remove.includes(part)){
                    response.send(not_permitted_err);
                    return;
                }
            }
            
        }

        // If none of these matches, then continue the request
        await next()
    
    }
}
