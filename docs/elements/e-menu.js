
Oxe.component.define({
	name: 'e-menu',
	created: function () {
		console.log('created e-menu');
	},
	style: `
		:host {
			--g: gray;
			--r-e-d: red;
		}
		:scope ul {
			background: var(--g);
		}
		:scope li {
			background: var(--r-e-d);
		}
	`,
	template: `
		<ul>
			<slot name="one"></slot>
			<slot name="two"></slot>
		</ul>
	`
});
