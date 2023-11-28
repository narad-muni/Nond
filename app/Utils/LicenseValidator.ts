import fs from "fs";
import jwt from "jsonwebtoken";
import { machineIdSync } from 'node-machine-id';

export default class LicenseValidator{
    public static async isLicenseValid() : Promise<[boolean, string]>{
        return [true, "Valid"];
        try{

            if(!await fs.existsSync("lic.jwt")){
                return [false, "Unable to find license"];
            }

            const license_file = fs.readFileSync("lic.jwt").toString();

            const jwt_data = jwt.verify(license_file, "SuperSecret");

            const epoch_now = Math.round(Date.now() / 1000);
            const machine_id = await LicenseValidator.getMachineIdShort();

            if(epoch_now > jwt_data?.expiry || jwt_data?.expiry == null){
                return [false, "Your license has been expired"];
            }

            if(machine_id != jwt_data?.machine){
                return [false, "Invalid license, license cannot be shared"];
            }

            return [true, "Valid"];

        }catch(e){
            console.log(e);
            return [false, "Unable to validate your license"];
        }
    }

    public static async update(license_data){
        const jwt_data = jwt.sign(license_data, "SuperSecret");

        await fs.writeFileSync('lic.jwt', jwt_data);
    }

    public static async getMachineIdShort(){
        return machineIdSync().substring(0, 10);
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
    "user_type": "single/concurrent"
}
`