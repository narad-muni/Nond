import fs from "fs";
import jwt from "jsonwebtoken";
import { machineIdSync } from 'node-machine-id';

export default class LicenseValidator{
    public static async isLicenseValid() : Promise<[boolean, string, object]>{
        try{

            const epoch_now = Math.round(Date.now() / 1000);
            const machine_id = await LicenseValidator.getMachineIdShort();

            if(!await fs.existsSync(".lic")){
                return [false, "Unable to find license", {"machine":machine_id}];
            }

            const license_file = fs.readFileSync(".lic").toString();

            const jwt_data = jwt.verify(license_file, "!4x-J(N*[(Mk+]8Wuriu0YvU2,QifN$qv_V4XraT+P_8963E6:gtcgmLT__/h.Hk");

            if(jwt_data?.application != "Nond"){
                jwt_data["machine"] = machine_id;
                return [false, "Invalid license, license is not for Nond", jwt_data];
            }

            if(epoch_now > jwt_data?.expiry || jwt_data?.expiry == null){
                jwt_data["machine"] = machine_id;
                return [false, `Your ${jwt_data?.subscription} license has been expired`, jwt_data];
            }

            if(machine_id != jwt_data?.machine){
                jwt_data["machine"] = machine_id;
                return [false, `Invalid license, license cannot be shared`, jwt_data];
            }

            jwt_data["machine"] = machine_id;
            return [true, "Valid", jwt_data];

        }catch(e){
            console.log(e);
            const machine_id = await LicenseValidator.getMachineIdShort();
            return [false, "Unable to validate your license " + e, {"machine":machine_id}];
        }
    }

    public static async update(license_data){
        const jwt_data = jwt.sign(license_data, "!4x-J(N*[(Mk+]8Wuriu0YvU2,QifN$qv_V4XraT+P_8963E6:gtcgmLT__/h.Hk");

        await fs.writeFileSync('.lic', jwt_data);
    }

    public static async getMachineIdShort(){
        return machineIdSync().substring(0, 10).toUpperCase();
    }

    public static async getLicenseData(){
        
    }
}


`
{
    "expiry": 19797912,
    "machine": "9621gbdjh71",
    "subscription": "regular/premium",
    "platform": "local/cloud",
    "size": 1000,
    "users": 2,
    "application": "Nond"
}
`