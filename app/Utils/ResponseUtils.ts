import { ResponseContract } from '@ioc:Adonis/Core/Response';

export default class ResponseUtils {
    public static CommonErrorResponse(response: ResponseContract) {
        response.send({
            status: "error",
            message: "some error occured"
        });
    }

    public static ErrorResponse(response: ResponseContract, message: any) {
        response.send({
            status: "error",
            message: message
        });
    }

    public static SuccessResponse(response: ResponseContract, data: any = "") {
        response.send({
            status: 'success',
            data: data
        });
    }
}
