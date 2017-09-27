import Transformer from './transformer.js';
import Utility from './utility.js';

export default function Loader (options) {
	this.loads = [];
	this.files = {};
	this.modules = {};
	this.esm = false;
	this.est = false;
	this.base = Utility.createBase();
	this.setup(options);
}

Loader.prototype.LOADED = 3;
Loader.prototype.LOADING = 2;

Loader.prototype.patterns = {
	imps: /import\s+\w+\s+from\s+(?:'|").*?(?:'|")/g,
	imp: /import\s+(\w+)\s+from\s+(?:'|")(.*?)(?:'|")/,
	exps: /export\s+(?:default\s*)?(?:function)?\s+(\w+)/g,
	exp: /export\s+(?:default\s*)?(?:function)?\s+(\w+)/,
};

Loader.prototype.setup = function (options) {
	options = options || {};
	this.loads = options.loads || this.loads;
	this.esm = options.esm === undefined ? this.esm : options.esm;
	this.est = options.est === undefined ? this.est : options.est;
	this.base = options.base === undefined ? this.base : Utility.createBase(options.base);
	return this;
};

Loader.prototype.getFile = function (data, callback) {
	if (!data.url) throw new Error('Loader requires a url');
	var self = this;

	if (data.url in self.modules && data.status) {
		if (data.status === self.LOADED) {
			if (callback) callback();
		} else if (data.status === self.LOADING) {
			if (!data.tag) {
				data.xhr.addEventListener('readystatechange', function () {
					if (data.xhr.readyState === 4) {
						if (data.xhr.status >= 200 && data.xhr.status < 400) {
							if (callback) callback(data);
						} else {
							throw new Error(data.xhr.responseText);
						}
					}
				});
			} else {
				data.element.addEventListener('load', function () {
					if (callback) callback(data);
				});
			}
		}
	} else {
		if (!data.tag) {
			data.xhr = new XMLHttpRequest();
			data.xhr.addEventListener('readystatechange', function () {
				if (data.xhr.readyState === 4) {
					if (data.xhr.status >= 200 && data.xhr.status < 400) {
						data.status = self.LOADED;
						data.text = data.xhr.responseText;
						if (callback) callback(data);
					} else {
						throw new Error(data.xhr.responseText);
					}
				}
			});
			data.xhr.open('GET', data.url);
			data.xhr.send();
		}

		data.status = self.LOADING;
	}
};

Loader.prototype.getImports = function (data) {
	var imp, imports = [];
	var imps = data.match(this.patterns.imps) || [];
	for (var i = 0, l = imps.length; i < l; i++) {
		imp = imps[i].match(this.patterns.imp);
		imports[i] = {
			raw: imp[0],
			name: imp[1],
			url: imp[2]
		};
	}
	return imports;
};

Loader.prototype.getExports = function (data) {
	return data.match(this.patterns.exps) || [];
};

Loader.prototype.normalizeUrl = function (url) {
	if (url.indexOf('.js') === -1) {
		url = url + '.js';
	}
	if (url.indexOf('/') !== 0) {
		url = Utility.joinSlash(this.base.replace(window.location.origin, ''), url);
	}
	return url;
};

Loader.prototype.handleImports = function (ast) {
	for (var i = 0, l = ast.imports.length; i < l; i++) {
		ast.imports[i].url = this.normalizeUrl(ast.imports[i].url);
		ast.cooked = ast.cooked.replace(ast.imports[i].raw, 'var ' + ast.imports[i].name + ' = $L.modules[\'' + ast.imports[i].url + '\']');
	}
};

Loader.prototype.handleExports = function (ast) {
	ast.cooked = ast.cooked.replace('export default', 'return');
};

Loader.prototype.toAst = function (data) {
	var ast = {};
	ast.raw = data;
	ast.imports = this.getImports(ast.raw);
	ast.exports = this.getExports(ast.raw);
	ast.cooked = ast.raw;
	this.handleImports(ast);
	this.handleExports(ast);
	return ast;
};

Loader.prototype.interpret = function (data) {
	data = '\'use strict\';\n\n' + data;
	return (function(d, l, w) { 'use strict';
		return new Function('$L', 'window', d)(l, w);
	}(data, this, window));
};

Loader.prototype.load = function (data, callback) {
	var self = this;

	if (data.constructor === String) data = { url: data };
	data.url = self.normalizeUrl(data.url);
	self.files[data.url] = data;

	if (data.url in self.modules) {
		return callback ? callback() : undefined;
	}

	self.getFile(data, function (d) {
		d.text = self.est ? Transformer.template(d.text) : d.text;

		if (self.esm || data.esm) {
			var ast = self.toAst(d.text);

			if (ast.imports.length) {
				var meta = {
					count: 0,
					imports: ast.imports,
					total: ast.imports.length,
					listener: function () {
						if (++meta.count === meta.total) {
							self.modules[d.url] = self.interpret(ast.cooked);
							if (callback) callback();
						}
					}
				};

				for (var i = 0, l = meta.imports.length; i < l; i++) {
					self.load(meta.imports[i].url, meta.listener);
				}
			} else {
				self.modules[d.url] = self.interpret(ast.cooked);
				if (callback) callback();
			}
		} else {
			self.modules[d.url] = self.interpret(d.text);
			if (callback) callback();
		}
	});
};

Loader.prototype.run = function () {
	for (var i = 0, l = this.loads.length; i < l; i++) {
		this.load(this.loads[i]);
	}
};

/*
	https://www.nczonline.net/blog/2013/06/25/eval-isnt-evil-just-misunderstood/
*/
