import Utility from '../utility.js';
import Piper from '../piper.js';
import Model from '../model.js';
import View from '../view.js';

export default function (binder, data) {
	// console.log('value');
	const self = this;
	const type = binder.target.type;
	const name = binder.target.nodeName;

	if (name === 'SELECT' || name.indexOf('-SELECT') !== -1) {
		return {
			read () {

				this.nodes = binder.target.options;
				this.multiple = Utility.multiple(binder.target);

				if (this.multiple && data.constructor !== Array) {
					throw new Error(`Oxe - invalid o-value ${binder.keys.join('.')} multiple select requires array`);
				}

			},
			write () {
				for (let i = 0, l = this.nodes.length; i < l; i++) {
					const node = this.nodes[i];
					const value = Utility.value(node, binder.container.model);

					if (this.multiple) {
						if (node.selected) {

							if (!node.disabled && !Utility.includes(data, value)) {
								binder.data.push(value);
							}

						} else if (Utility.includes(data, value)) {
							node.selected = true;
						}
					} else {
						if (node.selected) {

							if (!node.disabled && !Utility.compare(data, value)) {
								binder.data = value;
							}

							break;
						} else if (Utility.compare(data, value)) {
							node.selected = true;
							break;
						}
					}
				}
			}
		};
	} else if (type === 'radio') {
		return {
			read () {

				if (typeof data !== 'number') {
					// data = 0;
					// Model.set(binder.keys, data);
					return false;
				}

				this.nodes = binder.container.querySelectorAll(
					'input[type="radio"][o-value="' + binder.value + '"]'
				);

			},
			write () {
				let checked = false;

				for (let i = 0, l = this.nodes.length; i < l; i++) {
					const node = this.nodes[i];

					if (i === data) {
						checked = true;
						node.checked = true;
						node.setAttribute('checked', '');
					} else {
						node.checked = false;
						node.removeAttribute('checked');
					}

				}

				if (!checked) {
					this.nodes[0].checked = true;
					this.nodes[0].setAttribute('checked', '');
					// binder.data = 0;
					// Model.set(binder.keys, 0);
				}

			}
		};

	} else if (type === 'checkbox' || name.indexOf('-CHECKBOX') !== -1) {
		return {
			read () {

				if (typeof data !== 'boolean') {
					// data = false;
					// Model.set(binder.keys, data);
					return false;
				}

			},
			write () {

				binder.target.checked = data;

				if (data) {
					binder.target.setAttribute('checked', '');
				} else {
					binder.target.removeAttribute('checked');
				}

			}
		};
	} else {
		return {
			read () {

				// && binder.target.selected
				// if (name === 'OPTION' || name.indexOf('-OPTION') !== -1) {
					// const parent = binder.target.parentElement;
					// if (!parent) return false;
				 	// const select = parent.nodeName === 'SELECT' || parent.nodeName.indexOf('-SELECT') !== -1 ? parent : parent.parentElement;
					// const b = View.get(parent, 'value');
					// console.log(b);
					// if (select) {
					// 	self.default(select);
					// }
				// }

				// data = Model.get(binder.keys);

				if (data === binder.target.value) {
					return false;
				}

			},
			write () {
				binder.target.value = data === undefined || data === null ? '' : data;
			}
		};
	}
};
