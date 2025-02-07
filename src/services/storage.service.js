class JsonStorageService {
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

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export const storage = new JsonStorageService();
