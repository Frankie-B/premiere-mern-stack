const path = require('path');
const fs = require('fs');
const Generator = require('yeoman-generator');
const shell = require('shelljs');
const chalk = require('chalk');
const merge = require('webpack-merge');

module.exports = class extends Generator {
	// The name `constructor` is important here
	constructor(args, opts) {
		// Calling the super constructor is important so our generator is correctly set up
		super(args, opts);

		// Next, add your custom code
		//this.option('babel'); // This method adds support for a `--babel` flag
	}

	async prompting() {
		const gitName = this.user.git.name();

		this.answers = await this.prompt([
			{
				name: 'repoName',
				message: 'Git repo name:'
			},
			{
				name    : 'description',
				message : 'Description:',
			},
			{
				name: 'name',
				message: "Author's name:",
				default: gitName
			},
			{
				name: 'email',
				message: "Author's email:",
				default: this.user.git.email()
			},
			{
				name: 'githubUsername',
				message: 'GitHub username:',
				default: gitName
			},
			{
				name: 'cssPreprocessor',
				type: 'list',
				message: 'Select a CSS preprocessor',
				choices: [
					{
						name: 'Regular \'ol CSS',
						value: 'css'
					},
					{
						name: 'SCSS/SASS',
						value: 'scss'
					},
					{
						name: 'LESS',
						value: 'less'
					}
				]
			},
			{
				name: 'stylelint',
				type: 'confirm',
				message: "Would you like to use stylelint:"
			}
		]);

		this.tpl = {};
		this.tpl.repoName = this.answers.repoName;
		this.tpl.description = this.answers.description
		this.tpl.email = this.answers.email;
		this.tpl.name = this.answers.name;

		// this.spawnCommand('git', ['init', '--quiet']); // Initialize Git repo
	}

	writing() {
		// Helper function that moves files from one location to another
		const mv = (from, to) => this.fs.move(this.destinationPath(from), this.destinationPath(to));

		// Base dependencies and devDependencies for package.json
		const pkgJson = {
			devDependencies: {
				"@babel/core": "^7.1.2",
				"@babel/node": "^7.0.0",
				"@babel/preset-env": "^7.1.0",
				"@babel/preset-react": "^7.0.0",
				"autoprefixer": "^9.3.1",
				"babel-loader": "^8.0.4",
				"concurrently": "^4.0.1",
				"css-loader": "^1.0.1",
				"cssnano": "^4.1.7",
				"eslint": "^5.8.0",
				"eslint-loader": "^2.1.1",
				"eslint-plugin-react": "^7.5.1",
				"html-webpack-plugin": "^3.2.0",
				"node-sass": "^4.9.2",
				"nodemon": "^1.12.5",
				"optimize-css-assets-webpack-plugin": "^5.0.1",
				"postcss-loader": "^3.0.0",
				"style-loader": "^0.23.1",
				"uglifyjs-webpack-plugin": "^2.0.1",
				"webpack": "^4.23.1",
				"webpack-cli": "^3.1.2",
				"webpack-dev-server": "^3.1.10",
				"webpackbar": "^2.6.1"
			},
			dependencies: {
				"body-parser": "^1.18.2",
				"chalk": "^2.3.2",
				"compression": "^1.7.1",
				"connect-mongo": "^2.0.1",
				"dotenv": "^6.0.0",
				"express": "^4.16.2",
				"express-session": "^1.15.6",
				"helmet": "^3.13.0",
				"mongoose": "^5.2.12",
				"path": "^0.12.7",
				"react": "^16.2.0",
				"react-dom": "^16.2.0",
				"react-router-dom": "^4.2.2",
			}
		};

		let webpackFilePath = path.join(__dirname, './templates/webpack/default/_webpack.config.js');

		this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

		// Check for stylelint
		if (this.answers.stylelint) {
			console.log(chalk.blue("Installing stylelint!!!"));
			this.fs.extendJSON(this.destinationPath('package.json'), {
				devDependencies: {
					"stylelint": "^9.7.1",
					"stylelint-order": "^1.0.0",
					"stylelint-webpack-plugin": "^0.10.5"
				}
			});
		}

		// Check CSS Preprocessor
		if (this.answers.cssPreprocessor === 'scss') {
			this.fs.extendJSON(this.destinationPath('package.json'), {
				devDependencies: {
					"sass-loader": "^7.1.0",
				}
			});

			webpackFilePath = path.join(__dirname, './templates/webpack/scss/_webpack.config.js');
		} else if(this.answers.cssPreprocessor === 'less') {
			this.fs.extendJSON(this.destinationPath('package.json'), {
				devDependencies: {
					"less-loader": "^4.1.0",
				}
			});

			webpackFilePath = path.join(__dirname, './templates/webpack/less/_webpack.config.js');
		}

		const webpackDest = path.resolve(this.destinationRoot(), 'webpack.config.js');

		this.fs.copyTpl(
			this.templatePath('**/*'),
			this.destinationRoot(),
			this.tpl,
			undefined,
			{ globOptions: {
				dot: true,
				ignore: "_*.*"
			}}
		);

		fs.copyFileSync(webpackFilePath, webpackDest);
	}

	install() {
		this.npmInstall();
	}
}
