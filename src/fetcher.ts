
type FetcherOption = {
    path?:string
    method?:string
    origin?:string
    headers?:object
    acceptType?:string
    credentials?:string
    contentType?:string
    responseType?:string
    request?:(FetchOption) => void
    response?:(FetchOption) => void
}

type FetchOption = FetcherOption & {
    body?:any
    url?:string
    aborted?:boolean
}

export default new class Fetcher {

    option:FetcherOption = {}
    
    readonly types =[
        'json',
        'text',
        'blob',
        'formData',
        'arrayBuffer'
    ]

    readonly mime = {
        xml: 'text/xml; charset=utf-8',
        html: 'text/html; charset=utf-8',
        text: 'text/plain; charset=utf-8',
        json: 'application/json; charset=utf-8',
        js: 'application/javascript; charset=utf-8'
    }

    async setup (option:FetcherOption = {}) {
        this.option.path = option.path;
        this.option.method = option.method;
        this.option.origin = option.origin;
        this.option.request = option.request;
        this.option.headers = option.headers;
        this.option.response = option.response;
        this.option.acceptType = option.acceptType;
        this.option.credentials = option.credentials;
        this.option.contentType = option.contentType;
        this.option.responseType = option.responseType;
    }

    async method (method:string, data?:string|object) {
        data = typeof data === 'string' ? { url: data } : data;
        return this.fetch({ ...data, method });
    }

    async get () {
        return this.method('get', ...arguments);
    }
    
    async put () {
        return this.method('put', ...arguments);
    }
    
    async post () {
        return this.method('post', ...arguments);
    }
    
    async head () {
        return this.method('head', ...arguments);
    }
    
    async patch () {
        return this.method('patch', ...arguments);
    }
    
    async delete () {
        return this.method('delete', ...arguments);
    }
    
    async options () {
        return this.method('options', ...arguments);
    }
    
    async connect () {
        return this.method('connect', ...arguments);
    }

    async serialize (data) {
        let query = '';

        for (const name in data) {
            query = query.length > 0 ? query + '&' : query;
            query = query + encodeURIComponent(name) + '=' + encodeURIComponent(data[name]);
        }

        return query;
    }

    async fetch (data:FetchOption = {}) {
        const { option } = this;
        const context = { ...option, ...data };

        if (context.path && typeof context.path === 'string' && context.path.charAt(0) === '/') context.path = context.path.slice(1);
        if (context.origin && typeof context.origin === 'string' && context.origin.charAt(context.origin.length-1) === '/') context.origin = context.origin.slice(0, -1);
        if (context.path && context.origin && !context.url) context.url = context.origin + '/' + context.path;

        if (!context.method) throw new Error('Oxe.fetcher - requires method option');
        if (!context.url) throw new Error('Oxe.fetcher - requires url or origin and path option');

        context.aborted = false;
        context.headers = context.headers || {};
        context.method = context.method.toUpperCase();

        Object.defineProperty(context, 'abort', {
            enumerable: true,
            value () { context.aborted = true; return context; }
        });

        if (context.contentType) {
            switch (context.contentType) {
                case 'js': context.headers['Content-Type'] = this.mime.js; break;
                case 'xml': context.headers['Content-Type'] = this.mime.xml; break;
                case 'html': context.headers['Content-Type'] = this.mime.html; break;
                case 'json': context.headers['Content-Type'] = this.mime.json; break;
                default: context.headers['Content-Type'] = context.contentType;
            }
        }

        if (context.acceptType) {
            switch (context.acceptType) {
                case 'js': context.headers['Accept'] = this.mime.js; break;
                case 'xml': context.headers['Accept'] = this.mime.xml; break;
                case 'html': context.headers['Accept'] = this.mime.html; break;
                case 'json': context.headers['Accept'] = this.mime.json; break;
                default: context.headers['Accept'] = context.acceptType;
            }
        }

        if (typeof option.request === 'function') await option.request(context);
        if (context.aborted) return;

        if (context.body) {
            if (context.method === 'GET') {
                context.url = context.url + '?' + await this.serialize(context.body);
            } else if (context.contentType === 'json') {
                context.body = JSON.stringify(context.body);
            }
        }

        const result = await window.fetch(context.url, (context as any));

        Object.defineProperties(context, {
            result: { enumerable: true, value: result },
            code: { enumerable: true, value: result.status }
            // headers: { enumerable: true, value: result.headers }
            // message: { enumerable: true, value: result.statusText }
        });

        if (!context.responseType) {
            context.body = result.body;
        } else {
            const responseType = context.responseType === 'buffer' ? 'arrayBuffer' : context.responseType || '';
            const contentType = result.headers.get('content-type') || result.headers.get('Content-Type') || '';

            let type;
            if (responseType === 'json' && contentType.indexOf('json') !== -1) {
                type = 'json';
            } else {
                type = responseType || 'text';
            }

            if (this.types.indexOf(type) === -1) {
                throw new Error('Oxe.fetch - invalid responseType value');
            }

            context.body = await result[type]();
        }

        if (typeof option.response === 'function') await option.response(context);
        if (context.aborted) return;

        return context;
    }

}