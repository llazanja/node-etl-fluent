import connections from '../../global/Connections';

const createDateDim = connections.mysql.createDateDimensionTable("dDate", new Date("1996-01-01"), new Date("1998-12-31")).then(() => console.log('Created Date Dim'));

export default createDateDim;