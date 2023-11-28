import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GlobalState from 'App/Utils/GlobalState'

export default class LicenseValidator {
    public async handle({response}: HttpContextContract, next: () => Promise<void>) {
        
        if(GlobalState.is_license_valid){
            await next();
        }else{
            response.send({
                status: 'error',
                message: GlobalState.license_message
            });

            return;
        }
    }
}
