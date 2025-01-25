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

export {
    get,
    set,
}
