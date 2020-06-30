import { connections } from '../../global/Connections';

export default function createCOrdersTable() {
    return connections.postgresql.createTable(
        `CREATE TABLE IF NOT EXISTS "cOrders"
            ("ProductID" INT,
            "EmployeeID" INT,
            "SupplierID" INT,
            "CustomerID" INT,
            "DateID" INT,
            "TotalPrice" REAL NOT NULL,
            PRIMARY KEY("ProductID", "EmployeeID", "SupplierID", "CustomerID", "DateID"),
            CONSTRAINT fk_product FOREIGN KEY ("ProductID") REFERENCES "dProduct"("ProductID"),
            CONSTRAINT fk_employee FOREIGN KEY ("EmployeeID") REFERENCES "dEmployee"("EmployeeID"),
            CONSTRAINT fk_supplier FOREIGN KEY ("SupplierID") REFERENCES "dSupplier"("SupplierID"),
            CONSTRAINT fk_customer FOREIGN KEY ("CustomerID") REFERENCES "dCustomer"("CustomerID"),
            CONSTRAINT fk_date FOREIGN KEY ("DateID") REFERENCES "dDate"("DateID"))`);
};