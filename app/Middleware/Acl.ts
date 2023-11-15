import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Acl {
    public async handle({ request, response, session }: HttpContextContract, next: () => Promise<void>) {
        let req_url = request.url();

        if (!req_url.endsWith('/')) {
            req_url += '/'
        }

        const prefix_index = req_url.indexOf('/', 2);
        const url = req_url.substring(prefix_index + 1);
        const part = url.substring(0, url.indexOf('/'));
        const method = request.method();
        const role = session.get('user').role;

        const open_sections: string[] = [];

        if (!role) {
            session.forget('user');
        }

        // Options is open for all logged in users
        if (method == 'GET' && url.includes('options') && role) {
            await next();
            return;
        }

        // Open sections for all logged in users
        if (open_sections.includes(part) && role) {
            await next();
            return;
        }

        if (method == 'GET') {// Read Operation

            if (!role?.read[part]) {
                response.send({
                    status: 'error',
                    message: 'You do not have permission to read ' + part
                });
                return;
            }

        } else if (method == 'POST') {// Create Operation

            if (!role?.create[part]) {
                response.send({
                    status: 'error',
                    message: 'You do not have permission to create ' + part
                });
                return;
            }

        } else if (method == 'PUT') {// Update Operation

            if (!role?.update[part]) {
                response.send({
                    status: 'error',
                    message: 'You do not have permission to update ' + part
                });
                return;
            }

        } else if (method == 'DELETE') {// Delete Operation

            if (url.includes('destroy')) {
                if (!role?.destroy[part]) {
                    response.send({
                    status: 'error',
                    message: 'You do not have permission to delete ' + part
                });
                    return;
                }
            } else {
                if (!role?.remove[part]) {
                    response.send({
                    status: 'error',
                    message: 'You do not have permission to remove ' + part
                });
                    return;
                }
            }

        }

        // If none of these matches, then continue the request
        await next();

    }
}
