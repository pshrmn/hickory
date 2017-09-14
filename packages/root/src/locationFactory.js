var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { completePathname, completeHash, completeQuery, stripBaseSegment } from '@hickory/location-utils';
function defaultParseQuery(query) {
    return query ? query : '';
}
function defaultStringifyQuery(query) {
    return query ? query : '';
}
function isValidBase(baseSegment) {
    return (typeof baseSegment === 'string' &&
        baseSegment.charAt(0) === '/' &&
        baseSegment.charAt(baseSegment.length - 1) !== '/');
}
function validateQueryOption(query) {
    var parse, stringify;
    return query
        ? query
        : {
            parse: defaultParseQuery,
            stringify: defaultStringifyQuery
        };
}
export default function locationFactory(options) {
    if (options === void 0) { options = {}; }
    var query = options.query, _a = options.decode, decode = _a === void 0 ? true : _a, _b = options.baseSegment, baseSegment = _b === void 0 ? '' : _b, _c = options.raw, raw = _c === void 0 ? function (p) { return p; } : _c;
    var _d = validateQueryOption(query), parse = _d.parse, stringify = _d.stringify;
    if (baseSegment !== '' && !isValidBase(baseSegment)) {
        throw new Error('The baseSegment "' + baseSegment + '" is not valid.' +
            ' The baseSegment must begin with a forward slash and end with a' +
            ' non-forward slash character.');
    }
    function parsePath(value) {
        var location = {};
        // hash is always after query, so split it off first
        var hashIndex = value.indexOf('#');
        if (hashIndex !== -1) {
            location.hash = value.substring(hashIndex + 1);
            value = value.substring(0, hashIndex);
        }
        else {
            location.hash = '';
        }
        var queryIndex = value.indexOf('?');
        if (queryIndex !== -1) {
            location.query = parse(value.substring(queryIndex + 1));
            value = value.substring(0, queryIndex);
        }
        else {
            location.query = parse();
        }
        location.pathname = stripBaseSegment(value, baseSegment);
        return location;
    }
    function createLocation(value, key, state) {
        if (state === void 0) { state = null; }
        var partial;
        if (typeof value === 'string') {
            partial = parsePath(value);
        }
        else {
            partial = __assign({}, value);
            if (partial.hash == null) {
                partial.hash = '';
            }
            if (partial.query == null) {
                partial.query = parse();
            }
            if (partial.pathname == null) {
                partial.pathname = '/';
            }
        }
        // don't set state if it already exists
        if (state && !partial.state) {
            partial.state = state;
        }
        var location = __assign({}, partial, { key: key, rawPathname: raw(partial.pathname) });
        location.key = key;
        location.rawPathname = raw(location.pathname);
        // it can be more convenient to interact with the decoded pathname,
        // but leave the option for using the encoded value
        if (decode) {
            try {
                location.pathname = decodeURI(location.pathname);
            }
            catch (e) {
                throw e instanceof URIError
                    ? new URIError('Pathname "' + location.pathname + '" could not be decoded. ' +
                        'This is most likely due to a bad percent-encoding. For more information, ' +
                        'see the third paragraph here https://tools.ietf.org/html/rfc3986#section-2.4')
                    : e;
            }
        }
        return location;
    }
    function createPath(location) {
        // ensure that pathname begins with a forward slash, query begins
        // with a question mark, and hash begins with a pound sign
        return (baseSegment +
            completePathname(location.rawPathname ||
                location.pathname ||
                '') +
            completeQuery(stringify(location.query)) +
            completeHash(location.hash));
    }
    return {
        createLocation: createLocation,
        createPath: createPath
    };
}
