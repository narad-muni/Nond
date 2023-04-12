import Scheduler from "App/Models/Scheduler";

export default class SchedulersController {
    public async index(){
        const data = await Scheduler
            .all()

        return data;
    }

    public async get(id: number){
        const data = await Scheduler
            .query()
            .where('id',id)
            .first();

        return data;
    }

    public async create(scheduler: Scheduler){
        const data = await Scheduler.create(scheduler);

        //set "null" to null
        Object.keys(data).forEach(e => {
            if(data[e] == "null" || data[e] == ""){
                data[e] = null;
            }
        });

        return data;
    }

    public async update(scheduler: Scheduler){
        const data = await Scheduler
            .query()
            .where('id',scheduler.id)
            .update(scheduler);

        return data;
    }

    public async destroy(ids: number[]){
        await Scheduler
            .query()
            .whereIn('id',ids)
            .delete()

        return;
    }
}
