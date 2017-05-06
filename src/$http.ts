import { $Promise } from "light-promise-js";

export interface IHttpRequestOptions {
    method: string,
    url: string,
    data?: any,
    username?: string,
    password?: string,
    headers: Object
}

export function $http(options: IHttpRequestOptions): Promise<any> {
    return new $Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open(options.method, options.url, true, options.username, options.password);
        for (var key in options.headers) {
            request.setRequestHeader(key, options.headers[key]);
            if (key.toLowerCase() === "content-type" && options.headers[key].toLowerCase().indexOf('json') !== -1 && options.data !== void 0) {
                options.data = JSON.stringify(options.data);
            }
        }
        request.onreadystatechange = (): any => {

            if (request.readyState === XMLHttpRequest.DONE) {
                var result = {
                    status: request.status,
                    headers: parseHeaders(request.getAllResponseHeaders()),
                    data: null
                }
                var content = request.responseText;
                if (result.headers["content-type"].toLowerCase().indexOf('json') !== -1) {
                    var safe = safeJson(content);
                    var json = jsonTryParse(safe);
                    if (json !== void 0) {
                        content = json.__$data !== void 0? json.__$data : json;
                    }
                }
                result.data = content;
                if (request.status <= 200 && request.status < 300) {
                    resolve(result);
                } else {
                    reject(result);
                }
            }
        }
        request.send(options.data);
    });
}

var _$http: any = (<any>$http);

_$http.GET        = "GET";
_$http.POST       = "POST";
_$http.PUT        = "PUT";
_$http.DELETE     = "DELETE";

_$http.get = (options: IHttpRequestOptions) => {
    options.method = _$http.GET;
    return $http(options);
};

_$http.post = (options: IHttpRequestOptions) => {
    options.method = _$http.POST;
    return $http(options);
};

_$http.put = (options: IHttpRequestOptions) => {
    options.method = _$http.PUT;
    return $http(options);
};

_$http.delete = (options: IHttpRequestOptions) => {
    options.method = _$http.DELETE;
    return $http(options);
};

function parseHeaders(headers: string) {
    var result = {};
    var splitHeaders = headers.split("\r\n");
    splitHeaders.forEach((header: string) => {
        if (header.trim() !== '') {
            var kv = header.split(/: (.+)/);
            result[kv[0].toLowerCase()] = kv[1];
        }
    });
    return result;
}

function safeJson(content: string) {
    content = content.trim();
    if (content[0] === '[') return '{ "__$data":' + content + '}';
    return content;
}

function jsonTryParse(content: string) {
    try {
        return JSON.parse(content);
    } catch(e) { }
}