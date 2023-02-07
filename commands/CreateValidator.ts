import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import fs from 'fs'

export default class CreateValidator extends BaseCommand {
    /**
     * Command name is used to run the command
     */
    public static commandName = 'create:validator'

    @args.string()
    public v_name: string

    /**
     * Command description is displayed in the "help" output
     */
    public static description = ''

    public static settings = {
        /**
         * Set the following value to true, if you want to load the application
         * before running the command. Don't forget to call `node ace generate:manifest` 
         * afterwards.
         */
        loadApp: false,

        /**
         * Set the following value to true, if you want this command to keep running until
         * you manually decide to exit the process. Don't forget to call 
         * `node ace generate:manifest` afterwards.
         */
        stayAlive: false,
    }

    public async run() {

        const file_data =
`import Joi from "joi";

export default class `+this.v_name+`Validator{

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
            `

        fs.writeFileSync('app/Validators/'+this.v_name+'Validator.ts',file_data);
    }
}
