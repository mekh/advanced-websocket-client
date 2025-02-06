const getNowDateStr = msToTimestamp => {
    const now = new Date();
    const date = new Date(now.getTime() - (now.getTimezoneOffset() * 60000 ))
        .toISOString()
        .split("T")
        .join(' ')
        .slice(0, -1); // remove trailing 'Z'

    return msToTimestamp === true ? date : date.slice(0, -4);
};

export { getNowDateStr }
