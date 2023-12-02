import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
    public async handle({ response, session }: HttpContextContract, next: () => Promise<void>) {
        if (!session.has('user')) {
            response.send({
                status: 'error',
                message: 'You are logged Out, Please refresh the page.'
            });
        } else {
            await next()
        }
    }
}
