const getItem = key => localStorage.getItem(key);
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const get = key => {
    const data = getItem(key);
    let ret = data;
    if (data !== null) {
        try {
            ret = JSON.parse(data);
        } catch (e) {
            // console.error('could not parse json from storage: ' + e.message);
        }
    }
    return ret;
};

const update = (key, value, path) => {
    const data = get(path);
    if (!data[key]) data[key] = [];
    if(data[key].includes(value)) return;

    data[key].push(value);

    set(path, data);
};

export {
    get,
    set,
    update,
}
