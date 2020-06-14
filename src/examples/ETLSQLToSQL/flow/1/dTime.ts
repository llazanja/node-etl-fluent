import connections from '../../global/Connections';

const createTimeDim = connections.mysql.createTimeDimensionTable("dTime").then(() => console.log('Created Time Dim'));

export default createTimeDim;