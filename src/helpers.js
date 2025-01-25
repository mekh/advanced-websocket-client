const getNowDateStr = msToTimestamp => {
    const now = new Date();
    const date = new Date(now.getTime() - (now.getTimezoneOffset() * 60000 ))
        .toISOString()
        .split("T")
        .join(' ')
        .slice(0, -1); // remove trailing 'Z'

    return msToTimestamp === true ? date : date.slice(0, -4);
};

const toJson = str => {
    let res;

    try {
        res = JSON.stringify(JSON.parse(str));
    } catch (e) {
        const data = str
            .replace(/\/\/.*/g, '') // remove comments
            .replace(/(\w+)\s*:\s/g, (_, sub) => `"${sub}":`) // wrap keys without quote with valid double quote
            .replace(/'([^']+)'\s*/g, (_, sub) => `"${sub}"`) // replacing single quote wrapped ones to double quote
            .replace(/,([\s,\n]*[\],}])/g, (_, sub) => sub); // remove trailing comma

        try {
            res = JSON.stringify(JSON.parse(data));
        } catch {
            res = str;
        }
    }

    return res;
};

export {
    getNowDateStr,
    toJson,
}
