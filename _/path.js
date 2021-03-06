
const resolve  = function () {
    const result = [];
    const origin = window.location.origin;
    const parser = window.document.createElement('a');

    for (let i = 0, l = arguments.length; i < l; i++) {
        const path = arguments[i];
        
        if (!path) continue;
        parser.href = path;

        if (parser.origin === origin) {
            if (path.indexOf(origin) === 0) {
                result.push(path.slice(origin.length));
            } else {
                result.push(path);
            }
        } else {
            return path;
        }

    }

    parser.href = result.join('/').replace(/\/+/g, '/');

    return parser.pathname;
};

export default Object.freeze({
    resolve
});
