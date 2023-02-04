import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee'

export default class AuthController {
    public async login({ response }: HttpContextContract){
        const user = Employee
            .query()
            .where('id',0)
            .where('username','admin')
            .where('password',await Hash.verify(,'admin123'))
            .first()

        response.send(await Hash.make('admin123'));
    }

    public async logout({}: HttpContextContract){}

    public async getUser({ session }: HttpContextContract){
        if(session.has('user')){
            
        }else{

        }
    }
}
