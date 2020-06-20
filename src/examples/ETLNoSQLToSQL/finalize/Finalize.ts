import { connections } from '../global/Connections';

export default function closePools() {
    const tasks: Promise<void>[] = [];
    Object.values(connections).forEach(connection => tasks.push(connection.closePool()));

    return Promise.all(tasks);
};
