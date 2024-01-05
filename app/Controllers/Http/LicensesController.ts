import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import GlobalState from 'App/Utils/GlobalState';
import Application from '@ioc:Adonis/Core/Application';
import LicenseValidator from 'App/Utils/LicenseValidator';

export default class LicensesController {

    public async status({ response }: HttpContextContract){
        response.send({
            "status": GlobalState.is_license_valid,
            "message": GlobalState.license_message,
        })
    }

    public async update({ request, response, session }: HttpContextContract){
        try{
            if(GlobalState.is_license_valid){
                if(!session.get('user')?.is_admin){
                    response.send({
                        "status": "error",
                        "message": "Only Admins have permission to replace existing license",
                    });

                    return;
                }
            }

            const license = request.file("license");
            await license?.move(Application.makePath("/"), {name:".lic",overwrite: true,});

            [GlobalState.is_license_valid, GlobalState.license_message, GlobalState.license_data] = await LicenseValidator.isLicenseValid();

            response.send({
                "status": "success",
                "message": "License uploaded successfully",
            });
        }catch(e){
            console.log(e);
            response.send({
                "status": "error",
                "message": "License uploade failed",
            });
        }
    }

    public async get({ response }: HttpContextContract) {
        const [valid, message, data] = await LicenseValidator.isLicenseValid();

        response.send({
            "status": valid,
            "message": message,
            "data": data
        });
    }

}
