import Methods from './methods.js';
import Loader from './loader.js';
import Model from './model.js';

import Binder from './binder.js';

export default {

	data: {},
	// lazy: true,
	compiled: false,

	async setup (options) {
		const self = this;

		options = options || {};

		if (options.components) {

			for (let i = 0, l = options.components.length; i < l; i++) {
				const component = options.components[i];

				if (typeof component === 'string') {
					const load = await Loader.load(component);
					component = load.default;
				}

				self.define(component);
			}

		}

	},

	node (node, target, type, container) {

		if (!type) throw new Error('Oxe.binder.bind - type argument required');
		if (!node) throw new Error('Oxe.binder.bind - node argument required');

		if (
			node.nodeName === 'SLOT' ||
			node.nodeName === 'TEMPLATE' ||
			node.nodeName === 'O-ROUTER' ||
			// node.nodeType === Node.TEXT_NODE ||
			// node.nodeType === Node.DOCUMENT_NODE ||
			// node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
		) {
			return;
		}

		const attributes = node.attributes;

		for (let i = 0, l = attributes.length; i < l; i++) {
			const attribute = attributes[i];

			if (attribute.value.indexOf('$') === 0) continue;

			if (
				attribute.name.indexOf('o-') === 0
				&& attribute.name !== 'o-scope'
				&& attribute.name !== 'o-reset'
				&& attribute.name !== 'o-action'
				&& attribute.name !== 'o-method'
				&& attribute.name !== 'o-enctype'
			) {

				let data;
				let pointer;

				const binder = Binder.create({
					target: node,
					container: container,
					name: attribute.name,
					value: attribute.value,
					scope: container.scope
				});

				if (type === 'remove') {
					// this.remove(binder);
					pointer = Binder.get(binder);
					Binder.remove(binder);
					data = undefined;
				} else if (type === 'add') {
					Binder.add(binder);

					pointer = Binder.get(binder);

					if (pointer.type === 'on') {
						data = Methods.get(pointer.keys);
					} else {
						data = Model.get(pointer.keys);
						data = Piper(pointer, data);
					}

					// this.add(binder);
				}

				Binder.render(pointer, data);
			}
		}

	},

	nodes (nodes, target, type, container) {
		for (let i = 0, l = nodes.length; i <l; i++) {
			const node = nodes[i];

			// if (
			// 	node.nodeType === Node.TEXT_NODE ||
			// 	node.nodeType === Node.DOCUMENT_NODE ||
			// 	node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
			// ) {
			// 	continue;
			// }

			if (node.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}

			const childContainer = node.scope || 'o-scope' in node.attributes ? node : container;

			this.node(node, target, type, container);
			this.nodes(node.childNodes, target, type, childContainer);
		}
	},

	renderSlot (target, source, scope) {
		const targetSlots = target.querySelectorAll('slot[name]');
		const defaultSlot = target.querySelector('slot:not([name])');

		for (let i = 0, l = targetSlots.length; i < l; i++) {

			const targetSlot = targetSlots[i];
			const name = targetSlot.getAttribute('name');
			const sourceSlot = source.querySelector('[slot="'+ name + '"]');

			if (sourceSlot) {
				targetSlot.parentNode.replaceChild(sourceSlot, targetSlot);
			} else {
				targetSlot.parentNode.removeChild(targetSlot);
			}

		}

		if (defaultSlot) {

			if (source.children.length) {
				// defaultSlot.parentNode.setAttribute('slot', 'default');

				while (source.firstChild) {
					defaultSlot.parentNode.insertBefore(source.firstChild, defaultSlot);
				}

			}

			defaultSlot.parentNode.removeChild(defaultSlot);
		}

	},

	// renderTemplate (template) {
	// 	let fragment = document.createDocumentFragment();
	//
	// 	if (template) {
	//
	// 		if (typeof template === 'string') {
	// 			let temporary = document.createElement('div');
	//
	// 			temporary.innerHTML = template;
	//
	// 			while (temporary.firstChild) {
	// 				fragment.appendChild(temporary.firstChild);
	// 			}
	//
	// 		} else {
	// 			fragment.appendChild(template);
	// 		}
	//
	// 	}
	//
	// 	return fragment;
	// }

	renderStyle (style, scope) {

		if (!style) return '';

		if (!window.CSS || !window.CSS.supports || !window.CSS.supports('(--t: black)')) {
			let matches = style.match(/--\w+(?:-+\w+)*:\s*.*?;/g);

			for (let i = 0, l = matches.length; i < l; i++) {
				let match = matches[i];
				let rule = match.match(/(--\w+(?:-+\w+)*):\s*(.*?);/);
				let pattern = new RegExp('var\\('+rule[1]+'\\)', 'g');
				style = style.replace(rule[0], '');
				style = style.replace(pattern, rule[2]);
			}

		}

		if (!window.CSS || !window.CSS.supports || !window.CSS.supports(':scope')) {
			style = style.replace(/\:scope/g, '[o-scope="' + scope + '"]');
		}

		if (!window.CSS || !window.CSS.supports || !window.CSS.supports(':host')) {
			style = style.replace(/\:host/g, '[o-scope="' + scope + '"]');
		}

		return '<style>' + style + '</style>';
	},

	render (element, options) {
		const self = this;

		element.setAttribute('o-scope', element.scope);

		if (self.compiled && element.parentElement.nodeName === 'O-ROUTER') {
			return;
		}

		const template = document.createElement('template');
		const style = self.renderStyle(options.style, element.scope);

		template.innerHTML = style + options.template;

		const clone = document.importNode(template.content, true);

		View.nodes(clone);

		if (options.shadow) {
			if ('attachShadow' in document.body) {
				element.attachShadow({ mode: 'open' }).appendChild(clone);
			} else if ('createShadowRoot' in document.body) {
				element.createShadowRoot().appendChild(clone);
			}
		} else {
			self.renderSlot(clone, element);
			element.appendChild(clone);
		}

	},

	define (options) {
		const self = this;

		if (!options.name) throw new Error('Oxe.component.define - requires name');
		if (options.name in self.data) throw new Error('Oxe.component.define - component previously defined');

		self.data[options.name] = options;

		options.count = 0;
		options.style = options.style || '';
		options.model = options.model || {};
		options.methods = options.methods || {};
		options.shadow = options.shadow || false;
		options.template = options.template || '';
		options.properties = options.properties || {};

		options.construct = function () {
			const instance = window.Reflect.construct(HTMLElement, [], this.constructor);

			options.properties.created = {
				value: false,
				enumerable: true,
				configurable: true
			};

			options.properties.scope = {
				enumerable: true,
				value: options.name + '-' + options.count++
			};

			options.properties.model = {
				enumerable: true,
				get: function () {
					return Model.get(this.scope);
				},
				set: function (data) {
					return Model.set(this.scope, data && typeof data === 'object' ? data : {});
				}
			};

			options.properties.methods = {
				enumerable: true,
				get: function () {
					return Methods.get(this.scope);
				}
			};

			Object.defineProperties(instance, options.properties);
			Model.set(instance.scope, options.model);
			Methods.set(instance.scope, options.methods);

			return instance;
		};

		options.construct.prototype.attributeChangedCallback = function () {
			if (options.attributed) options.attributed.apply(this, arguments);
		};

		options.construct.prototype.adoptedCallback = function () {
			if (options.adopted) options.adopted.call(this);
		};

		options.construct.prototype.connectedCallback = function () {

			if (!this.created) {

				self.render(this, options);

				Object.defineProperty(this, 'created', {
					value: true,
					enumerable: true,
					configurable: false
				});

				if (options.created) {
					options.created.call(this);
				}

			}

			if (options.attached) {
				options.attached.call(this);
			}
		};

		options.construct.prototype.disconnectedCallback = function () {
			if (options.detached) {
				options.detached.call(this);
			}
		};

		Object.setPrototypeOf(options.construct.prototype, HTMLElement.prototype);
		Object.setPrototypeOf(options.construct, HTMLElement);

		window.customElements.define(options.name, options.construct);
	}

};
