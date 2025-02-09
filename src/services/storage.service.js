class JsonStorageService {
    /**
     * @param {string} key
     * @return {string|object}
     */
    get(key) {
        const data = localStorage.getItem(key);

        let result = data;

        if (data !== null) {
            try {
                result = JSON.parse(data);
            } catch (e) {}
        }

        return result;
    }

    /**
     * @param {string} key
     * @param {string|object|null} value
     */
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export const storage = new JsonStorageService();
