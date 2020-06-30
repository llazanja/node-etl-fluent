import { connections } from '../../global/Connections';

export default function createDTimeTable() {
    return connections.postgresql.createTimeDimensionTable('dTime');
};