import connections from '../global/Connections';

Object.values(connections).forEach(connection => connection.closePool());