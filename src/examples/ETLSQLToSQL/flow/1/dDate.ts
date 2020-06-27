import { connections } from '../../global/Connections';

export default function createDDateTable() {
    return connections.mysql.createDateDimensionTable("dDate", new Date("2006-01-01"), new Date("2020-12-31"));
}
