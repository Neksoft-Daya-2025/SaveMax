/* Developed by RUDRA via NEKLLM */
import { applyTenantFilter } from './tenant';

export function propertyViewFilter(session: any, query: any = {}) {
    const scoped = applyTenantFilter(session, query);
    const view = session?.user?.permissions?.properties?.view;
    if (view === 'own' && session?.user?.id) {
        return { $and: [scoped, { $or: [
            { createdBy: session.user.id },
            { agent: session.user.id },
            { owner: session.user.id },
        ] }] };
    }
    if (view !== true && view !== 'all') return { ...scoped, _id: null };
    return scoped;
}
