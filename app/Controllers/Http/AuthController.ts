import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee'
import AuthValidator from 'App/Validators/AuthValidator';
import Crypto from 'crypto';

export default class AuthController {
    public async login({ request, response, session }: HttpContextContract) {
        try {

            const dirty_payload = {
                username: request.input('username'),
                password: request.input('password')
            }

            const payload = AuthValidator.LoginValidator(dirty_payload);

            let resp = {}

            if (payload.error) {
                resp = {
                    status: "error",
                    message: payload.error.details[0].message
                }
            } else {
                const user = await Employee
                    .query()
                    .preload('role')
                    .where('deleted', false)
                    .where('username', payload.value.username)
                    .where('password', Crypto.createHash('sha256').update(payload.value.password).digest('hex'))
                    .first()

                resp = {
                    status: user ? "success" : "error",
                    message: user ? "" : "User not found",
                    data: user
                }

                if (user) {
                    session.put('user', user);
                }
            }

            response.send(resp);

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async logout({ session, response }: HttpContextContract) {
        try {

            if (session.has('user')) {
                session.forget('user');
            }

            response.send({
                status: "success",
                message: "User logged out"
            });

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async isLoggedIn({ session, response }: HttpContextContract) {
        try {
            if (session.has('user')) {

                response.send({
                    status: "success",
                    message: "User logged in"
                });

            } else {

                response.send({
                    status: "error",
                    message: "User not logged in"
                });

            }
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async user({ session, response }: HttpContextContract) {
        try {
            if (session.has('user')) {

                response.send({
                    status: "success",
                    data: session.get('user')
                });

            } else {

                response.send({
                    status: "error",
                    message: "User not logged in",
                    data: null
                });

            }
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
