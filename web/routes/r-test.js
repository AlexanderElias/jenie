import Say from '../modules/say.js';

export default {
	title: 'Test',
	path: './test',
	description: 'A mighty tiny web components framework/library!',
	component: {
		name: 'r-test',
		model: {
			submit: 'hello world',
			empty: {},
			blank: '',
			numRadio: 0,
			showHide: true,
			isChecked: true,
			text: 'Hello from model',
			loopy: { doopy: 'soopy' },
			items: [
				{ it: { val: 0 } },
				{ it: { val: 1 } },
				{ it: { val: 2 } }
			],
			o: [
				{ n: 1, a: [ '1' ] },
				{ n: 2, a: [ '2' ] },
				{ n: 3, a: [ '3' ] }
			],
			eo: {
				one: 1,
				two: 2,
				three: 3,
			},
			arrayChange: [1, 2],
			html: '<h3 o-text="text"></h3>'
		},
		methods: {
			say: Say,
			submit: function (data) {
				console.log(data);
			},
			mod: function () {
				console.log('here');
				console.log(arguments);
			},
			lower: function (text) {
				text = text || '';
				return text.toLowerCase();
			},
			upper: function (text) {
				text = text || '';
				return text.toUpperCase();
			},
			overwriteArray: function () {
				this.model.arrayChange = [3, 4, 5, 6];
			},
			foo: function (e, item) {
				console.log(item);
				console.log('foo');
			},
			toggleShowHide: function () {
				this.model.showHide = !this.model.showHide;
			},
			submitGet: function () {
				console.log(arguments);
			},
			s0: function (data, e) {
				var model = this.model;
				if (data.username === '') {
					model.message = 'username required';
				} else {
					return {
						data: data,
						reset: true,
						url: '/foo',
						method: 'get',
						handler: function (result) {
							console.log(result);
						}
					}
				}
			},
			fetch: function () {
				const options = { url: 'https://jsonplaceholder.typicode.com/todos/1' };
				return Promise.resolve()
					.then(Oxe.fetcher.get.bind(null, options))
					.then(console.log)
					.catch(console.error);
			}
		},
		properties: {
			add: {
				enumerable: true,
				value: function () {
					var total = 0;
					for (var i = 0; i < arguments.length; i++) {
						total += arguments[i];
					}
					return total;
				}
			}
		},
		created: function () {
			var self = this;

			window.self = self;

			var total = self.add(1, 2, 3);

			// self.model.items = [
			// 	{ it: { val: 0 } },
			// 	{ it: { val: 1 } },
			// 	{ it: { val: 2 } },
			// 	{ it: { val: 3 } },
			// 	{ it: { val: 4 } },
			// ];

			setTimeout(function () {
				var increaseInterval = setInterval(function () {

					if (self.model.items.length === 10) {
						clearInterval(increaseInterval);

						var decreaseInterval = setInterval(function () {
							if (self.model.items.length === 5) {
								clearInterval(decreaseInterval);
							} else {
								self.model.items.pop();
							}
						}, 90);

					} else {
						self.model.items.push({ it: { val: self.model.items.length } });
					}

				}, 90);
			}, 3000);

			Say('r-test created');

			console.log(this.model.o);
			// [
			// 	{ n: 1, a: [ '1' ] },
			// 	{ n: 2, a: [ '2' ] },
			// 	{ n: 3, a: [ '3' ] }
			// ]

			// this.model.empty.$set({ boo: 'ha'});
		},
		template: `
		<style>
			[o-each-item] {
				min-height: 150px;
			}
		</style>
		<br>
		<br>

		<strong o-text="nah">nah</strong>
		<strong o-show="isshow">isshow</strong>
		<strong o-hide="ishide">ishide</strong>

		<form o-submit="s0" o-reset>
			<div o-text="loopy.doopy"></div>
			<input type="text" o-value="loopy.doopy" placeholder="text" required><br>
			<input type="text" o-value="blank" placeholder="text" required><br>
			<input type="submit" name="Submit">
		</form>
		<br>
		<br>

		<div o-show="showHide">Now you see me!</div>
		<button o-on-click="toggleShowHide">Show/Hide</button>
		<br>
		<br>

		<c-menu>
			<li slot="one">Item One</li>
			<li slot="two">Item Two</li>
		</c-menu>
		<br>
		<br>

		<c-menu>
			<li>Item Three</li>
			<li>Item Four</li>
		</c-menu>
		<br>
		<br>

		<p o-text="text | upper"></p>
		<p o-text="text | lower"></p>
		<input type="text" o-value="text | lower" placeholder="text">
		<input type="text" o-value="text | upper" placeholder="text">
		<br>
		<br>

		<div o-text="isChecked"></div>
		<input type="checkbox" o-value="isChecked">
		<br>
		<br>

		<div o-text="initiallyNotOnModel">initiallyNotOnModel</div>
		<input type="checkbox" o-value="initiallyNotOnModel">
		<br>
		<br>

		<div o-text="numRadio"></div>
		<input type="radio" o-value="numRadio">
		<input type="radio" o-value="numRadio">
		<br>
		<br>

		<div o-text="items.0.it.val"></div>
		<input type="text" o-value="items.0.it.val">
		<div o-each-item="items">
			<span>
				<span>$item</span>
				<span o-on-click="foo | item" o-text="item.it.val"></span>
				<span>,</span>
			</span>
		</div>

		<button o-on-click="say">Console Log</button>
		<br>
		<br>

		<div o-each-item="eo">
			<span>
				<span>$item</span>
				<span o-text="item"></span>
				<span>,</span>
			</span>
		</div>
		<br>
		<br>

		<form o-submit="submit">
			<input type="text" o-value="submit"/>
			<input type="submit" value="Submit Form"/>
		</form>
		<br>
		<br>

		<ul>
			<li>
				<a href="./test">test</a>
			</li>
			<li>
				<a href="./js">
					<strong>js</strong>
				</a>
			</li>
			<li>
				<a href="./js?name=ferret&color=purple#hash">js?name=ferret&amp;color=purple#hash</a>
			</li>
			<li>
				<a href="./js/?name=ferret&color=purple#hash">js/?name=ferret&amp;color=purple#hash</a>
			</li>
			<li>
				<a href="https://google.com/">google</a>
			</li>
			<li>
				<a href="https://google.com/" external>google external</a>
			</li>
			<li>
				<a href="https://google.com/" target="_blank">google target_blank</a>
			</li>
		</ul>
		<br>
		<br>

		<button o-on-click="fetch">Fetch</button>
		<br>
		<br>

		<div o-html="html"></div>
		`
	}
}
