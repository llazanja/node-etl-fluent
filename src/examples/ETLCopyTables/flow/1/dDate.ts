import connections from '../../global/Connections';

export default function createDDateTable() {
    return connections.postgresql.createTable('CREATE TABLE IF NOT EXISTS "dDate" ("DateID" SERIAL, "Type" VARCHAR(15), "Date" DATE, "Year" INT, "Quarter" INT, "Month" INT, "Day" INT, "DayOfWeek" INT, "DayOfWeekName" VARCHAR(15), "MonthName" VARCHAR(15))');
}
