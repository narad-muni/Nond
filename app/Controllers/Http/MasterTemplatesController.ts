import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MasterTemplatesController {
    public async index({}: HttpContextContract){}

    public async indexMaster({}: HttpContextContract){}

    public async get({}: HttpContextContract){}

    public async getMaster({}: HttpContextContract){}

    public async options({}: HttpContextContract){}

    public async columns({}: HttpContextContract){}

    public async create({}: HttpContextContract){}

    public async update({}: HttpContextContract){}

    public async remove({}: HttpContextContract){}

    public async destroy({}: HttpContextContract){}
}
