import Joi from "joi";

export default class ClientValidator {

    public static LoginValidator(requestData) {

        const schema = {
            username: Joi
                .string()
                .alphanum()
                .min(3)
                .max(20)
                .required(),

            password: Joi
                .string()
                .min(8)
                .max(20)
                .required()
        }

        const JoiObject = Joi.object(schema);

        return JoiObject.validate(requestData);
    }

    public static indexValidator(body) {
        const schema = {
            deleted: Joi
                .boolean()
                .required(),
        }

        const JoiObject = Joi.object(schema);

        return JoiObject.validate(body);
    }

    public static indexMasterValidator(body) {
        const schema = {
            deleted: Joi
                .boolean()
                .required(),
        }

        const JoiObject = Joi.object(schema);

        return JoiObject.validate(body);
    }

    public static getValidator(body) {
        const schema = {
            id: Joi
                .number()
                .required(),
        }

        const JoiObject = Joi.object(schema);

        return JoiObject.validate(body);
    }

    public static createValidator(body) {
        const schema = {
            name: Joi
                .string()
                .allow(null)
                .required(),

            group_id: Joi
                .number()
                .allow(null)
                .required(),
        }

        const JoiObject = Joi.object(schema).unknown();

        return JoiObject.validate(body.client);
    }

    public static updateValidator(body) {
        const schema = {
            name: Joi
                .string()
                .allow(null)
                .required(),

            group_id: Joi
                .number()
                .allow(null)
                .required(),
        }

        const JoiObject = Joi.object(schema).unknown();

        return JoiObject.validate(body.client);
    }

    public static bulkServiceUpdateClientValidator(body) {
        const schedulerSchema = Joi
            .object()
            .pattern(
                // Keys are scheduler id
                Joi.number().required(),
                // Scheduler pattern
                Joi.object({
                    service_id: Joi
                        .number()
                        .required(),
                    frequency: Joi
                        .string()
                        .allow(null, '')
                        .required(),
                    next: Joi
                        .date()
                        .allow(null, '')
                        .required(),
                    count: Joi
                        .number()
                        .allow(null, '')
                        .required(),
                    subscribed: Joi
                        .boolean()
                        .required(),
                })
            );

        const schema = {
            client_ids: Joi
                .array()
                .items(
                    Joi.number()
                )
                .required(),
            remove_old: Joi
                .boolean()
                .required(),
            schedulers: schedulerSchema,
        }

        const JoiObject = Joi.object(schema);

        return JoiObject.validate(body);
    }

    public static removeClientValidator(body) {
        const schema = {
            client_ids: Joi
                .array()
                .items(Joi.number())
                .required(),
        }

        const JoiObject = Joi.object(schema).unknown();

        return JoiObject.validate(body);
    }

    public static restoreClientValidator(body) {
        const schema = {
            client_ids: Joi
                .array()
                .items(Joi.number())
                .required(),
        }

        const JoiObject = Joi.object(schema).unknown();

        return JoiObject.validate(body);
    }

    public static deleteClientValidator(body) {
        const schema = {
            client_ids: Joi
                .array()
                .items(
                    Joi
                        .number()
                        .min(1)
                        .messages({ "number.min": "Cannot delete default users" })
                )
                .required(),
        }

        const JoiObject = Joi.object(schema).unknown();

        return JoiObject.validate(body);
    }

}
