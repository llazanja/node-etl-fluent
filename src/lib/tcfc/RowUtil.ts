import CompositeKey from "./CompositeKey";

export default class RowUtil {
   static toRowMap(rows: object[], depth: number, keyNames: string[], countAlias: string): Map<string, number> {
      const map = new Map<string, number>();

      rows.forEach((row: { [key: string]: any }) => {
         const key: { [key: string]: any } = {};

         if (depth == 0) {
            key['level0'] = 'level0'
         } else {
            for (let i = 0; i < depth; i++) {
               let attrName = keyNames[i].replace(/"/g, '');
               const parts = attrName.split('.');
               if (parts.length == 2) {
                  attrName = parts[1];
               }

               key[attrName] = row[attrName];
            }
         }
      
         const compositeKey = new CompositeKey(key);

         map.set(compositeKey.toString(), Number(row[countAlias.replace(/"/g, '')]));
      });

      return map;
   }
}