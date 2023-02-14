import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FilesController {

    public async get({ request,response }: HttpContextContract){
        const path = request.url().substring(1);
        const file = Application.makePath(path);
        if(file){
            response.download(file);
        }
    }

}