import Utility from './utility';
import Events from './events';
import INDEX from './index';

export default function Router (options) {
	Events.call(this);

	this.title = '';
	this.cache = {};
	this.route = {};
	this.query = {};
	this.location = {};
	this.parameters = {};
	this.component = null;
	this.isRan = false;

	this.routes = [];
	this.hash = false;
	this.trailing = false;
	this.view = 'o-view';

	this.base = Utility.createBase();
	this.setup(options);
}

Router.prototype = Object.create(Events.prototype);
Router.prototype.constructor = Router;

Router.prototype.setup = function (options) {
	options = options || {};
	this.view = options.view === undefined ? this.view: options.view;
	this.hash = options.hash === undefined ? this.hash : options.hash;
	this.routes = options.routes === undefined ? this.routes: options.routes;
	this.loader = options.loader === undefined ? this.loader : options.loader;
	this.batcher = options.batcher === undefined ? this.batcher: options.batcher;
	// this.handler = options.handler === undefined ? this.handler: options.handler;
	this.external = options.external === undefined ? this.external: options.external;
	this.container = options.container === undefined ? this.container: options.container;
	this.trailing = options.trailing === undefined ? this.trailing : options.trailing;
	this.base = options.base === undefined ? this.base : Utility.createBase(options.base);
	return this;
};

Router.prototype.popstate = function (e) {
	this.navigate(e.state || window.location.href, true);
};

Router.prototype.click = function (e) {
	var self = this;

	// if shadow dom use
	var target = e.path ? e.path[0] : e.target;
	var parent = target.parentNode;

	if (self.container) {
		while (parent) {
			if (parent === self.container) {
				break;
			} else if (parent === document.body) {
				return e.preventDefault();
			} else {
				parent = parent.parentNode;
			}
		}
	}

	if (e.metaKey || e.ctrlKey || e.shiftKey) return;

	// ensure target is anchor tag
	while (target && 'A' !== target.nodeName) target = target.parentNode;
	if (!target || 'A' !== target.nodeName) return;

	// if external is true then default action
	if (self.external && (
		self.external.constructor.name === 'RegExp' && self.external.test(target.href) ||
		self.external.constructor.name === 'Function' && self.external(target.href) ||
		self.external.constructor.name === 'String' && self.external === target.href
	)) return;

	// check non acceptable attributes and href
	if (target.hasAttribute('download') ||
		target.hasAttribute('external') ||
		target.hasAttribute('o-external') ||
		// target.hasAttribute('target') ||
		target.href.indexOf('mailto:') !== -1 ||
		target.href.indexOf('file:') !== -1 ||
		target.href.indexOf('tel:') !== -1 ||
		target.href.indexOf('ftp:') !== -1
	) return;

	e.preventDefault();
	if (this.location.href === target.href) return;
	self.navigate(target.href);
};

Router.prototype.testPath = function (routePath, userPath) {
	return new RegExp(
		'^' + routePath
		.replace(/{\*}/g, '(?:.*)')
		.replace(/{(\w+)}/g, '([^\/]+)')
		+ '(\/)?$'
	).test(userPath);
};

Router.prototype.toParameterObject = function (routePath, userPath) {
	var parameters = {};
	var brackets = /{|}/g;
	var pattern = /{(\w+)}/;
	var userPaths = userPath.split('/');
	var routePaths = routePath.split('/');

	for (var i = 0, l = routePaths.length; i < l; i++) {
		if (pattern.test(routePaths[i])) {
			var name = routePaths[i].replace(brackets, '');
			parameters[name] = userPaths[i];
		}
	}

	return parameters;
};

Router.prototype.toQueryString = function (data) {
	if (!data) return;

	var query = '?';

	for (var key in data) {
		query += key + '=' + data[key] + '&';
	}

	return query.slice(-1); // remove trailing &
};


Router.prototype.toQueryObject = function (path) {
	if (!path) return;

	var result = {};
	var queries = path.slice(1).split('&');

	for (var i = 0, l = queries.length; i < l; i++) {
		var query = queries[i].split('=');
		result[query[0]] = query[1];
	}

	return result;
};

Router.prototype.getLocation = function (path) {
	var location = {};

	location.pathname = decodeURI(path);
	location.origin = window.location.origin;
	location.base = this.base ? this.base : location.origin;

	if (location.base.slice(-3) === '/#/') {
		location.base = location.base.slice(0, -3);
	}

	if (location.base.slice(-2) === '/#') {
		location.base = location.base.slice(0, -2);
	}

	if (location.base.slice(-1) === '/') {
		location.base = location.base.slice(0, -1);
	}

	if (location.pathname.indexOf(location.base) === 0) {
		location.pathname = location.pathname.slice(location.base.length);
	}

	if (location.pathname.indexOf(location.origin) === 0) {
		location.pathname = location.pathname.slice(location.origin.length);
	}

	if (location.pathname.indexOf('/#/') === 0) {
		location.pathname = location.pathname.slice(2);
	}

	if (location.pathname.indexOf('#/') === 0) {
		location.pathname = location.pathname.slice(1);
	}

	var hashIndex = this.hash ? location.pathname.indexOf('#', location.pathname.indexOf('#')) : location.pathname.indexOf('#');
	if (hashIndex !== -1) {
		location.hash = location.pathname.slice(hashIndex);
		location.pathname = location.pathname.slice(0, hashIndex);
	} else {
		location.hash = '';
	}

	var searchIndex = location.pathname.indexOf('?');
	if (searchIndex !== -1) {
		location.search = location.pathname.slice(searchIndex);
		location.pathname = location.pathname.slice(0, searchIndex);
	} else {
		location.search = '';
	}

	if (this.trailing) {
		location.pathname = this.join(location.pathname, '/');
	} else {
		location.pathname = location.pathname.replace(/\/$/, '');
	}

	if (location.pathname.charAt(0) !== '/') {
		location.pathname = '/' + location.pathname;
	}

	if (this.hash) {
		location.href = Utility.joinSlash(location.base, '/#/', location.pathname);
	} else {
		location.href =  Utility.joinSlash(location.base, '/', location.pathname);
	}

	location.href += location.search;
	location.href += location.hash;

	return location;
};

Router.prototype.scroll = function (x, y) {
	window.scroll(x, y);
	return this;
};

Router.prototype.back = function () {
	window.history.back();
	return this;
};

Router.prototype.redirect = function (path) {
	window.location.href = path;
};

Router.prototype.add = function (route) {
	if (route.constructor.name === 'Object') {
		this.routes.push(route);
	} else if (route.constructor.name === 'Array') {
		this.routes = this.routes.concat(route);
	}
	return this;
};

Router.prototype.remove = function (path) {
	for (var i = 0, l = this.routes.length; i < l; i++) {
		if (path === this.routes[i].path) {
			this.routes.splice(i, 1);
		}
	}
	return this;
};

Router.prototype.get = function (path) {
	for (var i = 0, l = this.routes.length; i < l; i++) {
		var route = this.routes[i];
		if (path === route.path) {
			return route;
		}
	}
	return this;
};

Router.prototype.find = function (path) {
	for (var i = 0, l = this.routes.length; i < l; i++) {
		var route = this.routes[i];
		if (this.testPath(route.path, path)) {
			return route;
		}
	}
	return this;
};

Router.prototype.addToBatcher = function (route) {
	var self = this, component;

	component = self.cache[route.component];

	if (!component) {
		component = self.cache[route.component] = document.createElement(route.component);
		component.inRouterCache = false;
		component.isRouterComponent = true;
	}

	self.batcher.write(function () {
		var child;
		while (child = self.view.firstChild) self.view.removeChild(child);
		self.view.appendChild(component);
		self.scroll(0, 0);
		self.emit('navigated');
	});

	return this;
};

Router.prototype.render = function (route) {
	var self = this;

	if (route.title) document.title = route.title;
	if (route.url && !(route.component in self.cache)) {
		self.loader.load(route.url, function () {
			self.addToBatcher(route);
		});
	} else {
		self.addToBatcher(route);
	}
};

Router.prototype.navigate = function (data, replace) {
	var self = this;

	if (typeof data === 'string') {
		var path = data; data = {};
		data.location = self.getLocation(path);
		data.route = self.find(data.location.pathname) || {};
		data.query = self.toQueryObject(data.location.search) || {};
		data.parameters = self.toParameterObject(data.route.path || '', data.location.pathname) || {};
		data.component = data.route.component;
		data.title = data.route.title || '';
	}

	self.title = data.title;
	self.route = data.route;
	self.query = data.query;
	self.location = data.location;
	self.parameters = data.parameters;

	window.history[replace ? 'replaceState' : 'pushState'](data, self.title, self.location.href);

	if (self.route.handler) {
		self.route.handler(self.route);
	} else if (self.route.redirect) {
		self.redirect(self.route.redirect);
	} else {
		self.render(self.route);
	}

	return self;
};

Router.prototype.run = function () {
	var self = this;

	if (self.isRan) return;
	else self.isRan = true;

	self.view = document.body.querySelector(self.view);

	if (!self.view) {
		throw new Error('Router requires o-view element');
	}

	self.navigate(window.location.href, true);

	return self;
};
