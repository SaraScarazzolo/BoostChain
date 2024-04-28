import getUuidByString from 'uuid-by-string';

export const genUUID = (string: string): string => {
    return getUuidByString(string + Date.now(), 5);
};
