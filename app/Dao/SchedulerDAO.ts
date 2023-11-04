import Scheduler from 'App/Models/Scheduler';

export default class SchedulerDAO {
    public static async getSchedulersFromServiceJSON(serviceJSON: object, client_id: number) {
        const schedulers: Scheduler[] = [];
        const uncheckedSchedulers: Scheduler[] = [];

        //create new scheduler objects
        for (const [service_id, service] of Object.entries(serviceJSON)) {

            const scheduler = new Scheduler();

            // Set id if this is existing entry
            if (service.id) {
                scheduler.id = service.id;
            }

            scheduler.type = 5;
            scheduler.client_id = client_id;
            scheduler.service_id = Number(service_id);
            scheduler.register_id = service.register_id;
            scheduler.next = service.next;
            scheduler.frequency = service.frequency;
            scheduler.count = service.count;

            if (service.subscribed) {
                schedulers.push(scheduler);
            } else {
                uncheckedSchedulers.push(scheduler);
            }
        }

        return { schedulers, uncheckedSchedulers };
    }

    public static async createScheduler(scheduler: Scheduler): Promise<Scheduler> {
        return await Scheduler.create(scheduler);
    }

    public static async createSchedulers(schedulers: Scheduler[]): Promise<Scheduler[]> {
        return await Scheduler.createMany(schedulers);
    }

    public static async createSchedulerForClients(client_ids: number[], scheduler: Scheduler): Promise<Scheduler[]> {
        const schedulers: Scheduler[] = [];

        for (const client_id of client_ids) {
            schedulers.push({
                client_id: client_id,
                type: 5,
                service_id: scheduler.service_id,
                frequency: scheduler.frequency,
                next: scheduler.next
            } as Scheduler);
        }

        return await Scheduler.createMany(schedulers);
    }

    public static async createSchedulersForClients(client_ids: number[], schedulers: Scheduler[]): Promise<Scheduler[]> {
        const new_schedulers: Scheduler[] = [];

        for (const client_id of client_ids) {
            for (const scheduler of Object.values(schedulers)) {
                new_schedulers.push({
                    client_id: client_id,
                    type: 5,
                    service_id: scheduler.service_id,
                    frequency: scheduler.frequency,
                    next: scheduler.next
                } as Scheduler);
            }
        }

        return await Scheduler.createMany(new_schedulers);
    }

    public static async deleteSchedulers(ids: number[]) {
        await Scheduler
            .query()
            .whereIn('id', ids)
            .delete();
    }

    public static async deleteSchedulersByClientAndServiceId(client_ids: number[], service_ids: number[]) {
        await Scheduler
            .query()
            .whereIn('client_id', client_ids)
            .whereIn('service_id', service_ids)
            .delete();
    }

    public static async updateSchedulers(schedulers: Scheduler[]): Promise<Scheduler[]> {

        const scheduler_objects: any = [];

        schedulers.forEach(scheduler => {
            scheduler_objects.push(scheduler.serialize());
        });

        return await Scheduler
            .updateOrCreateMany(
                'id',
                scheduler_objects
            );
    }

    public static async segregateSchedulers(schedulers: Scheduler[], uncheckedSchedulers: Scheduler[]) {
        const newSchedulers: Scheduler[] = [];
        const updatedSchedulers: Scheduler[] = [];
        const deletedSchedulerIds: number[] = [];

        for (const scheduler of schedulers) {
            if (scheduler.id == null) {
                newSchedulers.push(scheduler);
            } else {
                updatedSchedulers.push(scheduler);
            }
        }

        for (const scheduler of uncheckedSchedulers) {
            if (scheduler.id != null) {
                deletedSchedulerIds.push(scheduler.id);
            }
        }

        return { newSchedulers, updatedSchedulers, deletedSchedulerIds }
    }

    public static async deleteSchedulersByClientId(client_ids: number[]) {
        await Scheduler
            .query()
            .whereIn('client_id', client_ids)
            .delete();
    }
}
