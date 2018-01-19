import Component from './component';
import Utility from './utility';
import Batcher from './batcher';
import Fetcher from './fetcher';
import Router from './router';
import Loader from './loader';
import Binder from './binder';
import Keeper from './keeper';
import Model from './model';
import View from './view';

var Global = Object.defineProperties({}, {
	window: {
		enumerable: true,
		get: function () {
			return window;
		}
	},
	document: {
		enumerable: true,
		get: function () {
			return window.document;
		}
	},
	body: {
		enumerable: true,
		get: function () {
			return window.document.body;
		}
	},
	head: {
		enumerable: true,
		get: function () {
			return window.document.head;
		}
	},
	location: {
		enumerable: true,
		get: function () {
			return this.router.location;
		}
	},
	currentScript: {
		enumerable: true,
		get: function () {
			return (window.document._currentScript || window.document.currentScript);
		}
	},
	ownerDocument: {
		enumerable: true,
		get: function () {
			return (window.document._currentScript || window.document.currentScript).ownerDocument;
		}
	},
	global: {
		enumerable: true,
		value: {}
	},
	methods: {
		enumerable: true,
		value: {
			data: {}
		}
	},
	utility: {
		enumerable: true,
		value: Utility
	},
	model: {
		enumerable: true,
		value: new Model()
	},
	view: {
		enumerable: true,
		value: new View()
	},
	binder: {
		enumerable: true,
		value: new Binder()
	},
	keeper:{
		enumerable: true,
		value: new Keeper()
	},
	loader:{
		enumerable: true,
		value: new Loader()
	},
	router:{
		enumerable: true,
		value: new Router()
	},
	batcher:{
		enumerable: true,
		value: new Batcher()
	},
	fetcher:{
		enumerable: true,
		value: new Fetcher()
	},
	component:{
		enumerable: true,
		value: new Component()
	},
	setup: {
		enumerable: true,
		value: function (options) {

			if (this.isSetup) {
				return;
			} else {
				this.isSetup = true;
			}

			options = options || {};

			if (options.keeper) {
				this.keeper.setup(options.keeper);
			}

			if (options.fetcher) {
				this.fetcher.setup(options.fetcher);
			}

			if (options.loader) {
				this.loader.setup(options.loader);
			}

			if (options.router) {
				this.router.setup(options.router);
			}

			this.loader.run();
			this.router.run();
			this.model.run();
			this.view.run();
		}
	}
});

export default Global;
