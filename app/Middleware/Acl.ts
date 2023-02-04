import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Acl {
  public async handle({request,response,session}: HttpContextContract, next: () => Promise<void>) {
    const url = request.url().substring(5);
    const part = url.substring(0,url.indexOf('/'));
    const method = request.method()
    const role = session.get('user').role;
    const req_user_id = request.input('user_id');
    const user_id = session.get('user').id;
    const not_permitted_err = {
        status: 'error',
        message: 'Permission denied'
    }

    if(method == 'GET'){// Read Operation
        if(req_user_id == user_id){
            if(!role.read_self.includes(part)){//if operation not in user role list
                response.send(not_permitted_err);
            }
        }else{
            if(!role.read.includes(part)){//if operation not in user role list
                response.send(not_permitted_err);
            }
        }
    }else if(method == 'POST'){// Create Operation
        if(!role.create.includes(part)){//if operation not in user role list
            response.send(not_permitted_err);
        }
    }else if(method == 'PUT'){// Update Operation
        if(req_user_id == user_id){
            if(!role.update_self.includes(part)){//if operation not in user role list
                response.send(not_permitted_err);
            }
        }else{
            if(!role.update.includes(part)){//if operation not in user role list
                response.send(not_permitted_err);
            }
        }
    }else if(method == 'DELETE'){// Delete Operation
        if(part.includes('destroy')){
            if(!role.destroy.includes(part)){//if operation not in user role list
                response.send(not_permitted_err);
            }
        }else{
            if(req_user_id == user_id){
                if(!role.destroy_self.includes(part)){//if operation not in user role list
                    response.send(not_permitted_err);
                }
            }else{
                if(!role.destroy.includes(part)){//if operation not in user role list
                    response.send(not_permitted_err);
                }
            }
        }
    }
    await next()
  }
}
