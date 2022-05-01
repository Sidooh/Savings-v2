import NodeCache from 'node-cache';

export const circularReplacer = () => {
    const visited = new WeakSet();

    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (visited.has(value)) return;

            visited.add(value);
        }

        return value;
    };
};

export const Cache = new NodeCache({stdTTL: 100, checkperiod: 120});