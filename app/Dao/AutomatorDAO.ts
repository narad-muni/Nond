import Automator from "App/Models/Automator";

export default class AutomatorDAO {
    public static async getAllAutomators(): Promise<Automator[]>{
        return await Automator
            .query()
            .orderBy('created_on', 'desc')
            .preload('user', (query) => {
                query.select('id', 'username')
            });
    }

    public static async createAutomators(automator: Automator[]): Promise<Automator[]>{
        const created = await Automator
            .createMany(automator);

        return await Automator
            .query()
            .preload('user', (query) => {
                query.select('id', 'username')
            })
            .whereIn('id', created.map(e => e.id));
    }

    public static async updateAutomatorById(automator: Automator): Promise<Automator>{
        await Automator
            .query()
            .where('id', automator.id)
            .update(automator.serialize());

        return await Automator
            .query()
            .preload('user', (query) => {
                query.select('id', 'username')
            })
            .where('id', automator.id)
            .firstOrFail();
    }

    public static async deleteAutomatorsById(ids: number[]): Promise<void>{
        await Automator
            .query()
            .whereIn('id', ids)
            .whereNot('status', 'Pending')
            .delete();
    }
}