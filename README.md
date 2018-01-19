**Beta API Can Change**

# Oxe
A mighty tiny web components framework/library.

### API
Api documentation can be found at [API.md](https://github.com/AlexanderElias/oxe/blob/master/API.md).

### Features
- Small size
- Module loading
- Front end routing
- Front end auth handling
- Automatic pollyfilling only if required
- In browser ES6/ESM Module and Template String pollyfill support (only export default)

### Support
- IE10~
- IE11
- Chrome
- Firefox
- Safari 7
- Mobile Safari
- Chrome Android

### Overview
Live examples [alexanderelias.github.io/oxe/](https://alexanderelias.github.io/oxe/).

### Install
- `npm i oxe --save`
- UMD `dist/oxe.min.js`
- UMD with Web Component Pollyfill `dist/oxe.polly.min.js`
- Web Component Pollyfill `dist/webcomponents-lite.min.js`

## Example
```js
Oxe.component.define({
	name: 'r-home',
	template: `
		<h1 o-text="title"></h1>
	`,
	model: {
		title: 'Old Title'
	},
	methods: {
		log: function () {
			console.log(this.model.title);
		}
	},
	created: function () {
		this.model.title = 'New Title';
	}
});
```
```js
Oxe.setup({
	keeper: {
		unauthorized: '/sign-in', // string or function
	},
	fetcher: {
		auth: true, // enables keeper for all fetches
	},
	loader: {
		transformers: {
			js: 'es', // enables ES6 module and template string re-writes
		},
		methods: {
			js: 'fetch'
		},
		loads: [
			'./index.css',
			'./routes/r-home.js',
			'./elements/e-menu.js'
		]
	},
	router: {
		auth: true, // enables keeper for all routes
		routes: [
			{
				auth: false, // individually disable/eneable auth
				path: '/',
				title: 'Home',
				template: '<r-home></r-home>',
			}
		]
	}
});
```
```html
<html>
<head>
	
	<base href="/">
	<script src="./oxe.min.js" o-index-url="./index.js" o-index-method="fetch" o-index-transformer="es" async></script>
	
</head>
<body>

	<e-menu>
		<ul>
			<li>
				<a href="/home">Home</a>
			</li>
		</ul>
	</e-menu>

	<o-router></o-router>

</body>
</html>
```

## Authors
[AlexanderElias](https://github.com/AlexanderElias)

## License
[Why You Should Choose MPL-2.0](http://veldstra.org/2016/12/09/you-should-choose-mpl2-for-your-opensource-project.html)
This project is licensed under the MPL-2.0 License
