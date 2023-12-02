import { SessionDriverContract } from '@ioc:Adonis/Addons/Session';
import GlobalState from 'App/Utils/GlobalState';

export class MemoryDriver implements SessionDriverContract {

    public async read(sessionId: string) {
        return GlobalState.SESSIONS.get(sessionId) || null;
    }

    public async write(sessionId: string, values: Record<string, any>) {
        GlobalState.SESSIONS.set(sessionId, values);
    }

    public async destroy(sessionId: string) {
        GlobalState.SESSIONS.delete(sessionId);
    }

    public async touch() {}
}