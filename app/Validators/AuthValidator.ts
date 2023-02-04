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
                .min(8)
                .max(20)
                .required()
        });



        let response = schema.validate(requestData);
        return response;
    }

}