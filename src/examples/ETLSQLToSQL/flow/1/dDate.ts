import connections from '../../global/Connections';

export default function createDDateTable() {
    return connections.mysql.createDateDimensionTable("dDate", new Date("1996-01-01"), new Date("1998-12-31"));
}
