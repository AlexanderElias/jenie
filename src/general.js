import Path from './path.js';

class General {

	constructor (options) {
		this.setup(options);
	}

	async setup (options) {
		options = options || {};

		if (options.base) {
			Path.base(options.base);
		}

	}

}

export default new General();
