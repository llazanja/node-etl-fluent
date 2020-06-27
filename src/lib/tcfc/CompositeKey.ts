export default class stringCompositeKey {
    value: { [key: string]: any }
    
    constructor(value: { [key: string]: any }) {
        this.value = value;
    }

    toString(): string {
        let str = '(';

        Object.values(this.value).forEach(value => str += (new String(value)).trim() + ', ');

        str = str.substring(0, str.length - 2) + ')';

        return str;
    }
};
