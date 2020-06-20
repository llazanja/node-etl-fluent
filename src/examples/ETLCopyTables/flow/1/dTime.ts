import connections from '../../global/Connections';

export default function createDTimeTable() {
    return connections.postgresql.createTable('CREATE TABLE IF NOT EXISTS "dTime" ("TimeID" SERIAL, "Type" VARCHAR(15), "Time" TIME, "SecondsAfterMidnight" INT, "MinutesAfterMidnight" INT, "Seconds" INT, "Minutes" INT, "Hour" INT, "Period" VARCHAR(15))');
};