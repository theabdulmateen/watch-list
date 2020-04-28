(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var __self__ = (function (root) {
function F() {
this.fetch = false;
this.DOMException = root.DOMException
}
F.prototype = root;
return new F();
})(typeof self !== 'undefined' ? self : this);
(function(self) {

var irrelevant = (function (exports) {
  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  return exports;

}({}));
})(__self__);
delete __self__.fetch.polyfill
exports = __self__.fetch // To enable: import fetch from 'cross-fetch'
exports.default = __self__.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = __self__.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = __self__.Headers
exports.Request = __self__.Request
exports.Response = __self__.Response
module.exports = exports

},{}],2:[function(require,module,exports){
const jikan             = require('./lib/jikan');

module.exports = jikan;

},{"./lib/jikan":3}],3:[function(require,module,exports){
//@ts-check
const Request               = require('./util/Request');
const Settings              = require('./util/Settings');

/**
 * Response Types:
 *
 * 200: OK
 * 400: Bad Request             -> invalid endpoint
 * 404: Not Found               -> id doesn't exist
 * 405: Method Not Allowed      -> wrong request method
 * 429: Too Many Requests       -> request limit is hit.
 *
 * Source: https://jikan.docs.apiary.io/
 */

class JikanAPI {

    /**
     *
     */
    constructor() {
        this.settings = Settings;
        this.request = new Request();
    }

    /**
     *
     * @param {number} id               Anime ID
     * @param {string} [request]       e.g. characters_staff, episodes, news, pictures, videos, stats, forum, moreinfo, reviews, recommendations, userupdates
     * @param {number} [parameter]     can be used to select a specific page for a anime which has more than 100 episodes
     */
    loadAnime(id, request, parameter) {
        return this.request.send(['anime', id, request, parameter]);
    }


    /**
     *
     * @param {number} id               Manga ID
     * @param {string} [request]       e.g. characters, news, pictures, stats, forum, moreinfo, reviews, recommendations, userupdates
     */
    loadManga(id, request) {
        return this.request.send(['manga', id, request]);
    }

    /**
     *
     * @param {number} id               Person ID
     * @param {string} [request]       e.g. pictures
     */
    loadPerson(id, request) {
        return this.request.send(['person', id, request]);
    }

    /**
     *
     * @param {number} id               Character ID
     * @param {string} [request]       e.g. pictures
     */
    loadCharacter(id, request) {
        return this.request.send(['character', id, request]);
    }

    // TODO add limit as a search Filter
    // TODO rebuild to /search/manga?q=Grand%20Blue&page=1
    /**
     * the query needs to be minimum of 3 letters to be processes by MyAnimeList
     * @param {string} type             only [anime, manga, person, character] allowed - version 1.7.1
     * @param {string} query            Search Query
     * @param {number} [page]
     * @param {{}} [params]             needs to be a key value (Parameter / Argument) pair like: {type: 'tv', status: 'airing'}
     */
    search(type, query, page = null, params = {}, limit = null) {
        if(query.length < 3) return Promise.reject(new Error(`The given query must be of minimum 3 letters! Given query '${query}' has only ${query.length} letters.`));

        params.q = query;
        if(page) params.page = page;
        if(limit) params.limit = limit;
        return this.request.send(['search', type], params);
    }

    /**
     *
     * @param {number} year             year
     * @param {string} season           available types [summer, spring, fall, winter]
     */
    loadSeason(year, season) {
        return this.request.send(['season', year, season]);
    }

    /**
     *
     */
    loadSeasonArchive() {
        return this.request.send(['season', 'archive']);
    }

    /**
     *
     */
    loadSeasonLater() {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['season', 'later']);
    }

    /**
     *
     * @param {string} [day]            available type [monday, tuesday, wednesday, thursday, friday, saturday, sunday, other (v3), unknown (v3)]
     */
    loadSchedule(day) {
        return this.request.send(['schedule', day]);
    }

    /**
     *
     * @param {string} type             available type [anime, manga, people (v3), characters (v3)]
     * @param {number} [page]           page number (50 items are on one Page)
     * @param {string} [subtype]  	    [Anime] airing, upcoming, tv, movie, ova, special [Manga] manga, novels, oneshots, doujin, manhwa, manhua [both] bypopularity, favorite
     */
    loadTop(type, page, subtype) {
        return this.request.send(['top', type, page, subtype]);
    }

    /**
     *
     * @param {string} type             available type [anime, manga]
     * @param {number} id               genre ID
     * @param {number} [page]           page number
     */
    loadGenre(type, id, page) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['genre', type, id, page]);
    }

    /**
     *
     * @param {number} id               producer ID
     * @param {number} [page]           page number
     */
    loadProducer(id, page) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['producer', id, page]);
    }

    /**
     *
     * @param {number} id               magazine ID
     * @param {number} [page]           page number
     */
    loadMagazine(id, page) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['magazine', id, page]);
    }

    /**
     *
     * @param {string} username         username
     * @param {string} [request]          [profile, history, friends, animelist, mangalist]
     * @param {string} [data]             addition data see API docs
     */
    loadUser(username, request, data) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['user', username, request, data]);
    }

    /**
     *
     * @param {number} id                 Club ID
     */
    loadClub(id) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['club', id]);
    }

    /**
     *
     * @param {number} id               Club ID
     * @param {number} [page]           page number. If this will be left empty, the default is 1
     */
    loadClubMembers(id, page) {
        if(this.settings.version < 3) return Promise.reject(new Error('Usable at API version 3+'));
        return this.request.send(['club', id, 'members', page]);
    }

    /**
     * Related to the Jikan REST Instance. --> see the official Jikan documentation
     * [to get status information use the function loadStatus]
     *
     * @param {string} type             e.g. anime, manga, characters, people, search, top, schedule, season
     * @param {string} period           e.g. today, weekly monthly
     * @param {number} [offset]         1000 request are shown for use the offset
     */
    loadMeta(type, period, offset) {
        return this.request.send(['meta', 'requests', type, period, offset]);
    }

    /**
     * is for loading the status of the Jikan REST Instance  --> see the official Jikan documentation
     */
    loadStatus() {
        return this.request.send(['meta', 'status']);
    }

    /**
     * can be used for stuff not yet covered with the current Jikanjs wrapper version
     * @param {Array} urlParts          e.g. [anime, 1] to load the anime with the id of 1
     * @param {Object} [queryParameter] query Parameter. Needs to be a key value pair like {type: 'tv', status: 'airing'}
     */
    raw(urlParts, queryParameter) {
        if(!Array.isArray(urlParts)) return Promise.reject(new Error(`The given parameter should be an array like [anime, 1] but given was ${urlParts}`));
        return this.request.send(urlParts, queryParameter);
    }
}

module.exports = new JikanAPI();

},{"./util/Request":4,"./util/Settings":5}],4:[function(require,module,exports){
//@ts-check

const Settings = require('./Settings');
const fetch = require('cross-fetch');

class Request {

    /**
     * sends a request with the given list of URL parts and the optional list of query parameter
     * @param {*[]} args           URL Parts
     * @param {{}} [parameter]     Query Parameter
     * @returns {Promise<*>} returns the request response or an error
     */
    async send(args, parameter) {
        var response = await fetch(this.urlBuilder(args, parameter));
        var data = await response.json();

        if (response.status !== 200) return Promise.reject(new Error(data.error));
        return Promise.resolve(data);
    }

    /**
     *
     * @param {*[]} args            URL Parts
     * @param {{}} [parameter]      Query Parameter
     * @returns {string}            URL
     */
    urlBuilder(args, parameter) {
        var url = new URL(Settings.getBaseURL());

        url.pathname += '/' + args.filter(x => x).join('/');
        if (parameter) Object.entries(parameter).forEach(([key, value]) => url.searchParams.append(key, value));

        return url.href;
    }
}

module.exports = Request;

},{"./Settings":5,"cross-fetch":1}],5:[function(require,module,exports){

class Settings {

    constructor(baseURL = 'https://api.jikan.moe', version = 3) {
        this.setBaseURL(baseURL, version);
    }

    /**
     * Delivers the full API Base URL
     * @returns {URL}
     */
    getBaseURL() {
        return this.baseURL;
    }

    /**
     * can be used to replace the current API Base URL by a complete new one
     * @param {string} baseURL
     * @param {number} [version]
     */
    setBaseURL(baseURL, version) {
        if(version) this.v = version;
        this.baseURL = new URL(`/v${this.v}`, baseURL);
    }

    /**
     * can be used to change the API version
     * @param {number} version
     */
    set version(version) {
        this.v = version;
        this.baseURL.pathname = `/v${version}`;
    }

    /**
     * delivers the currently used API version
     * @returns {number}
     */
    get version() {
        return this.v;
    }
}

module.exports = new Settings();

},{}],6:[function(require,module,exports){
(function (global){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
exports.default = global.fetch.bind(global);

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
const jikanjs   = require("jikanjs");
const fetch     = require("node-fetch");

const searchBar = document.getElementById("anime-search");
const dropdown = document.querySelector(".search-list");


searchBar.addEventListener("keydown", (event) => {
    event = event || window.event;
    dropdown.innerHTML = "";

    if (event.key !== "Escape") {
        const searchQuery = searchBar.value;

        if (searchQuery.length > 2) {
            jikanjs.search(type = 'anime', query = searchQuery, page = null, params = {}, limit = 10).then((animeList) => {
                if (animeList.length === 0) {
                    const textFeedback = document.createTextNode("No Data Available.");
                    const searchlist__details = document.createElement("div");
                    searchlist__details.classList.add("search-list__details");

                    searchlist__details.appendChild(textFeedback);

                    dropdown.appendChild(searchlist__item);
                } else {
                    animeList.results.forEach((anime) => {
                        const div = document.createElement("div");

                        const searchlist__details = document.createElement("div");
                        searchlist__details.classList.add("search-list__details");

                        const searchlist__item = document.createElement("div");
                        searchlist__item.classList.add("search-list__item");

                        const img = document.createElement("img");
                        img.src = anime.image_url;

                        const animeTitle = document.createElement("h2");
                        animeTitle.appendChild(document.createTextNode(anime.title));

                        const type = document.createElement("h4");
                        type.appendChild(document.createTextNode("Type: " + anime.type));

                        const score = document.createElement("span");
                        score.appendChild(document.createTextNode("Score: " + anime.score));
                        score.classList.add("search-list__score");

                        const synopsis = document.createElement("span");
                        synopsis.appendChild(document.createTextNode("Synopsis: " + anime.synopsis));
                        synopsis.classList.add("searchlist__synopsis");

                        const addButton = document.createElement("button");
                        addButton.appendChild(document.createTextNode("Add To WatchList"));
                        addButton.classList.add("ui");
                        addButton.classList.add("button");
                        addButton.classList.add("search-list__addButton");
                        addButton.addEventListener("click", (event) => {
                            addToWatchList(anime).catch(err => console.log(err));;
                        });

                        searchlist__details.appendChild(animeTitle);
                        searchlist__details.appendChild(type);
                        searchlist__details.appendChild(score);
                        searchlist__details.appendChild(synopsis);
                        searchlist__details.appendChild(addButton);

                        div.appendChild(img); 
                        div.appendChild(searchlist__details); 

                        searchlist__item.appendChild(div);
                        dropdown.appendChild(searchlist__item);
                    }); 
                }
            }).catch((err) => {
                console.error(err);
            });
        } else {

        }
    }
});


async function addToWatchList(anime) {
    const url = "/watchlist";
    const params = new URLSearchParams();

    let animeLoaded = await jikanjs.loadAnime(anime.mal_id, '' );

    let genre = animeLoaded.genres[0].name;
    for (let i = 1; i < animeLoaded.genres.length; i++) {
        genre += ", " + animeLoaded.genres[i].name;
    }

    params.append("movie[genre]", genre);
    params.append('movie[title]', anime.title);
    params.append('movie[synopsis]', anime.synopsis);

    const fetchParam = {
        method: "POST",
        body: params
    };

    let response = await fetch(url, fetchParam);
    window.location.href = "/watchlist";
}

// function genre() {
//     var genre = '';
//     return function(genres) {
//         genre = genres[0].name;
//         for (let i = 1; i < genres.length; i++) {
//             genre += ', ' + genres[i].name;
//         }
//         return genre;
//     }
// }
},{"jikanjs":2,"node-fetch":6}]},{},[7]);
