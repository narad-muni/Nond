import EmbeddedPostgres from 'embedded-postgres';

export default class PG {
    static __instance: EmbeddedPostgres;

    public static async startPG() {
        try{
            // Create the object
            const pg = new EmbeddedPostgres({
                databaseDir: './data/db',
                user: 'postgres',
                password: 'guju99',
                port: 5432,
                persistent: true,
            });

            try{
                await pg.initialise();
            }catch{}
        
            // Start the server
            await pg.start();

            this.__instance = pg;
        }catch(e){
            console.log(e);
        }
    }

    public static async stopPG() {
        try{
            console.log("Stopped");
            await this.__instance.stop();
        }catch(e){
            console.log(e);
        }
    }
}