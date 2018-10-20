import Binder from '../binder.js';
import Model from '../model.js';

export default function (binder) {
	let data;

	const type = binder.element.type;
	const name = binder.element.nodeName;

	if (name === 'SELECT') {
		let selected = false;

		data = Model.get(binder.keys);

		if (binder.element.multiple && data.constructor !== Array) {
			throw new Error(`Oxe - invalid multiple select value type ${binder.keys.join('.')} array required`);
		}

		// NOTE might need to handle disable
		for (let i = 0; i < binder.element.options.length; i++) {
			const element = binder.element.options[i];
			const value = data && data.constructor === Array ? data[i] : data;

			if (value && element.value === value) {
				element.setAttribute('selected', '');
				element.value = value;
				selected = true;
			} else {
				element.removeAttribute('selected');
			}

		}

		if (binder.element.options.length && !binder.element.multiple && !selected) {
			const value = data && data.constructor === Array ? data[0] : data;

			binder.element.options[0].setAttribute('selected', '');

			if (value !== (binder.element.options[0].value || '')) {
				Model.set(binder.keys, binder.element.options[0].value || '');
			}

		}

	} else if (type === 'radio') {
		const query = 'input[type="radio"][o-value="' + binder.value + '"]';
		const elements = binder.container.querySelectorAll(query);

		let checked = false;

		for (let i = 0, l = elements.length; i < l; i++) {
			const element = elements[i];

			if (i === data) {
				checked = true;
				element.checked = true;
			} else {
				element.checked = false;
			}

		}

		if (!checked) {
			elements[0].checked = true;
			if (data !== 0) {
				Model.set(binder.keys, 0);
			}
		}

	} else if (type === 'file') {
		data = data || [];

		for (let i = 0, l = data.length; i < l; i++) {

			if (data[i] !== binder.element.files[i]) {

				if (data[i]) {
					binder.element.files[i] = data[i];
				} else {
					console.warn('Oxe - file remove not implemented');
				}

			}

		}

	} else if (type === 'checkbox') {
		binder.element.checked = data === undefined ? false : data;

		if (data !== binder.element.checked) {
			Model.set(binder.keys, data === undefined ? false : data);
		}

	} else {
		return {
			read () {
				data = Model.get(binder.keys);

				if (binder.element.value === data) {
					return false;
				}

				// Model.set(binder.keys, data === undefined ? '' : data);
			},
			write () {
				binder.element.value = data;
			}
		};
	}
};
