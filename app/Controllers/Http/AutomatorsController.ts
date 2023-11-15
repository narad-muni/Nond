import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AutomatorDAO from 'App/Dao/AutomatorDAO';
import Automator from 'App/Models/Automator';
import ResponseUtils from 'App/Utils/ResponseUtils';

export default class AutomatorsController {
    public async index({ response }: HttpContextContract) {
        try {
            let data: Automator[] = await AutomatorDAO.getAllAutomators();

            ResponseUtils.SuccessResponse(response, data);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        try {
            const id = request.param('id');

            await AutomatorDAO.deleteAutomatorsById([id]);

            ResponseUtils.SuccessResponse(response);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }
}
