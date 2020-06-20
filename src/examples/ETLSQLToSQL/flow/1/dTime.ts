import connections from '../../global/Connections';

export default function createDTimeTable() {
    return connections.mysql.createTimeDimensionTable("dTime");
};