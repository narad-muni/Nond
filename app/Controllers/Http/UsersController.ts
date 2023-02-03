import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    response.send({
      status: 'success',
      data: [
        {id: 0,username: 'admin'},
        {id: 1,username: 'saumil'},
      ]
    });
  }

  public async get({ request,response }: HttpContextContract) {
    response.send({
      status: 'success',
      data: {id: request.param('id'),username: 'admin'}
    });
  }

  public async columns({ response }: HttpContextContract) {
    response.send({
      status: 'success',
      data: {
        id: {
          type: 'Text'
        },
        username: {
          type: 'Text'
        },
      }
    });
  }

  public async create({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
