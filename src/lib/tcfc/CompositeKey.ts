export default class stringCompositeKey {
    value: { [key: string]: any }
    
    constructor(value: { [key: string]: any }) {
        this.value = value;
    }

    toString(): string {
        let str = '(';

        Object.values(this.value).forEach(value => str += value + ', ');

        str = str.substring(0, str.length - 2) + ')';

        return str;
    }

    hashCode(): number {
        const str = this.toString();

        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            const character = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
    }
};
