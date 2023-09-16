import Joi from "joi";

export default class AuthValidator{

    public static LoginValidator(requestData){

        const schema = Joi.object({
            username: Joi.string()
                .alphanum()
                .min(3)
                .max(20)
                .required(),
            
            password: Joi.string()
                .min(4)
                .max(20)
                .required()
        });

        return schema.validate(requestData);
    }

}