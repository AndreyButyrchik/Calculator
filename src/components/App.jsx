import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';
import green from '@material-ui/core/colors/green';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import NumberFormat from 'react-number-format';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import './style.scss';
import { withStyles } from '@material-ui/core';
import {Decimal} from 'decimal.js';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			firstOperator: '+',
			secondOperator: '+',
			thirdOperator: '+',
			firstOperand: '0',
			secondOperand: '0',
			thirdOperand: '0',
			fourthOperand: '0',
			loading: false,
			answer: '',
			cheatMode: 'false',
			rounding: 'math',
			roundAnswer: '',
		};

		this.handleChangeFirstOperator = this.handleChangeFirstOperator.bind(this);
		this.handleChangeSecondOperator = this.handleChangeSecondOperator.bind(this);
		this.handleChangeThirdOperator = this.handleChangeThirdOperator.bind(this);
		this.onChangeSecondOperand = this.onChangeSecondOperand.bind(this);
		this.onChangeFirstOperand = this.onChangeFirstOperand.bind(this);
		this.onChangeThirdOperand = this.onChangeThirdOperand.bind(this);
		this.onChangeFourthOperand = this.onChangeFourthOperand.bind(this);
		this.calculate = this.calculate.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.formatNumber = this.formatNumber.bind(this);
		this.NumberFormatCustom = this.NumberFormatCustom.bind(this);
		this.addSpaces = this.addSpaces.bind(this);
		this.handleChangeRounding = this.handleChangeRounding.bind(this);
	}

	componentDidMount() {
		ValidatorForm.addValidationRule('range', value => {
			let dotNumber = value.replace(',', '.');
			let formatNumber = dotNumber.replace(/\s/g, '');
			if (Number(formatNumber) > 10e+15 || Number(formatNumber) < -10e+15) {
				return false;
			}
			return true;
		});
		ValidatorForm.addValidationRule('float', value => {
			const formatNumber = value.replace(',', '.');
			const float = formatNumber.split('.')[1];
			if (float && float.length > 2) {
				return false;
			}
			return true;
		});
		ValidatorForm.addValidationRule('pattern', value => {
			const reg = new RegExp(/^-?(\d+\s?)+(,\d+)*(\.\d+)?$/);
			if (reg.test(value)) {
				return true;
			}
			return false;
		});
	}

	NumberFormatCustom(props) {
		const { inputRef, onChange, ...other } = props;
		return (
			<NumberFormat
				{...other}
				getInputRef={inputRef}
				onValueChange={values => {
					onChange({
						target: {
							value: values.value,
						},
					});
				}}
				decimalSeparator="."
				decimalScale={2}
				thousandSeparator=" "
			/>
		);
	}

	handleChange() {
		this.setState({
			cheatMode: this.state.cheatMode === 'false' ? 'true' : 'false'
		});
	}

	handleChangeFirstOperator(event) {
		this.setState({
			firstOperator: event.target.value
		});
	}

	handleChangeSecondOperator(event) {
		this.setState({
			secondOperator: event.target.value
		});
	}

	handleChangeThirdOperator(event) {
		this.setState({
			thirdOperator: event.target.value
		});
	}

	onChangeSecondOperand(event) {
		this.setState({
			secondOperand: event.target.value
		});
	}

	onChangeFirstOperand(event) {
		this.setState({
			firstOperand: event.target.value
		});
	}

	onChangeThirdOperand(event) {
		this.setState({
			thirdOperand: event.target.value
		});
	}

	onChangeFourthOperand(event) {
		this.setState({
			fourthOperand: event.target.value
		});
	}

	formatNumber (x) {
		return x  && x !== 'Dividing by zero is impossible' ? this.addSpaces(x) : x;
	}

	addSpaces(x) {
		const newX = x.split('.')[0];
		const _x = newX.split('');
		let j = 0;
		for (let i = _x.length; i > 0; i--) {
			if(j === 3) {
				_x.splice(i, 0, ' ');
				j = 0;
			}
			j++;
		}
		let a = '';
		if(x.split('.')[1]) {
			a = x.split('.')[1];
		}
		return a ? _x.join('') + '.' + a : _x.join('');
	}

	handleChangeRounding(event) {
		let answer = this.state.answer;
		let roundAnswer = '';
		if (answer) {
			switch (event.target.value) {
				case 'math':
					Decimal.set({ rounding: Decimal.ROUND_HALF_UP })
					roundAnswer = new Decimal(answer).round();
					break;
				case 'banking':
					Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN })
					roundAnswer = new Decimal(answer).round();
					break;
				case 'truncation':
					Decimal.set({ rounding: Decimal.ROUND_DOWN })
					roundAnswer = new Decimal(answer).round();
					break;
				default:
					break;
			}
		}

		this.setState({
			rounding: event.target.value,
			roundAnswer: roundAnswer.toString()
		});
	}

	async calculate() {
		if(this.state.cheatMode === 'true') {
			await this.setState({
				answer: ''
			});
			const body = JSON.stringify(
				{
					lOperand: this.state.firstOperand.replace(',', '.'),
					operator: this.state.firstOperator, 
					rOperand: this.state.secondOperand.replace(',', '.')
				}
			);
			const config = {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body,
			};
			await this.setState({
				loading: true
			});
			const res = await fetch('/calculate', config);
			const answer = await res.json();
			await this.setState({
				loading: false,
				answer: answer.pods[1].subpods[0].plaintext
			});
		}
		else {
			const firstOperand = new Decimal(this.state.firstOperand.replace(',', '.').replace(/\s/g, ''));
			const secondOperand = new Decimal(this.state.secondOperand.replace(',', '.').replace(/\s/g, ''));
			const thirdOperand = new Decimal(this.state.thirdOperand.replace(',', '.').replace(/\s/g, ''));
			const fourthOperand = new Decimal(this.state.fourthOperand.replace(',', '.').replace(/\s/g, ''));
			let answer, roundAnswer;
			Decimal.set({ rounding: Decimal.ROUND_HALF_UP })
			try {
				switch (this.state.secondOperator) {
					case '+':
						answer = secondOperand.plus(thirdOperand);
						break;
					case '-':
						answer = secondOperand.minus(thirdOperand);
						break;
					case '*':
						answer = secondOperand.mul(thirdOperand);
						break;
					case '/':
						if (thirdOperand.equals(new Decimal('0'))) {
							throw 'Dividing by zero is impossible';
						} else {
							answer = secondOperand.dividedBy(thirdOperand).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
						}
						break;
					default:
						break;
				}
				if ((this.state.thirdOperator === '*' || this.state.thirdOperator === '/') && this.state.firstOperator !== '/') {
					console.log('before: ' + answer);
					switch (this.state.thirdOperator) {
						case '+':
							answer = answer.plus(fourthOperand);
							break;
						case '-':
							answer = answer.minus(fourthOperand);
							break;
						case '*':
							answer = answer.mul(fourthOperand);
							break;
						case '/':
							if (fourthOperand.equals(new Decimal('0'))) {
								throw 'Dividing by zero is impossible';
							} else {
								answer = answer.dividedBy(fourthOperand).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
							}
							break;
						default:
							break;
					}
					console.log('after: ' + answer);
					switch (this.state.firstOperator) {
						case '+':
							answer = answer.plus(firstOperand);
							break;
						case '-':
							answer = firstOperand.minus(answer);
							break;
						case '*':
							answer = answer.mul(firstOperand);
							break;
						case '/':
							if (answer.equals(new Decimal('0'))) {
								throw 'Dividing by zero is impossible';
							} else {
								answer = firstOperand.dividedBy(answer).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
							}
							break;
						default:
							break;
					}
					console.log('finish: ' + answer);
				} else {
					switch (this.state.firstOperator) {
						case '+':
							answer = firstOperand.plus(answer);
							break;
						case '-':
							answer = firstOperand.minus(answer);
							break;
						case '*':
							answer = firstOperand.mul(answer);
							break;
						case '/':
							if (answer.equals(new Decimal('0'))) {
								throw 'Dividing by zero is impossible';
							} else {
								answer = firstOperand.dividedBy(answer).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
							}
							break;
						default:
							break;
					}

					switch (this.state.thirdOperator) {
						case '+':
							answer = answer.plus(fourthOperand);
							break;
						case '-':
							answer = answer.minus(fourthOperand);
							break;
						case '*':
							answer = answer.mul(thirdOperand);
							break;
						case '/':
							if (fourthOperand.equals(new Decimal('0'))) {
								throw 'Dividing by zero is impossible';
							} else {
								answer = answer.dividedBy(fourthOperand).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
							}
							break;
						default:
							break;
					}
				}
			} catch (err) {
				answer = 'Dividing by zero is impossible';
				roundAnswer = 'Dividing by zero is impossible';
			}
			
			switch (this.state.rounding) {
				case 'math':
					Decimal.set({ rounding: Decimal.ROUND_HALF_UP })
					roundAnswer = new Decimal(answer).round();
					break;
				case 'banking':
					Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN })
					roundAnswer = new Decimal(answer).round();
					break;
				case 'truncation':
					Decimal.set({ rounding: Decimal.ROUND_DOWN })
					roundAnswer = new Decimal(answer).round();
					break;
				default:
					break;
			}

			this.setState({
				answer: answer.toString(),
				roundAnswer: roundAnswer.toString()
			});
		}
	}

	render() {
		const {classes} = this.props;

		const operators = [
			{value: '+', label: '+'},
			{value: '-', label: '-'},
			{value: '*', label: '*'},
			{value: '/', label: '/'}
		];

		const CustomSelect = withStyles({
			root: {
				width: '4rem'
			}
		})(TextField);

		return (
			<div className="container">
				{/* <div className="cheat">
					<Checkbox
						checked={this.state.checkedG}
						onChange={this.handleChange}
						value={this.state.cheatMode}
					/>
					<div>
						<Typography variant="h6">
							Cheat mode
						</Typography>
					</div>
				</div> */}
				<CssBaseline />
				<ValidatorForm
					onSubmit={this.calculate}
					className={classes.form}
				>
					<Grid container alignItems="center" spacing={16}>
						<Grid className={classNames(classes.flex1, classes.fixedHeight)} item>
							<TextValidator
								type="text"
								name="first-operand"
								id="first-operand" 
								variant="outlined"
								label="Enter first operand"
								autoComplete="off"
								className={classes.w100}
								value={this.state.firstOperand} 
								onChange={this.onChangeFirstOperand}
								validators={['required', 'range', 'float', 'pattern']}
								errorMessages={['this field is required', 'this field is out off range', 'float number is out of range', 'invalid number format']}
							/>
						</Grid>
						<Grid className={classes.fixedHeight} item>
							<CustomSelect
								id="firstOperator"
								select
								value={this.state.firstOperator}
								onChange={this.handleChangeFirstOperator}
								variant="outlined"
							>
								{operators.map(item => (
									<MenuItem key={item.value} value={item.value}>
										{item.label}
									</MenuItem>
								))}
							</CustomSelect>
						</Grid>
						<Grid className={classNames(classes.fixedHeight)} item>
							<Typography variant="h3">
								(
							</Typography>
						</Grid>
						<Grid className={classNames(classes.flex1, classes.fixedHeight)} item>
							<TextValidator
								name="second-operand"
								id="second-operand" 
								variant="outlined"
								autoComplete="off"
								label="Enter second operand"
								className={classes.w100}
								value={this.state.secondOperand} 
								onChange={this.onChangeSecondOperand}
								validators={['required', 'range', 'float', 'pattern']}
								errorMessages={['this field is required', 'this field is out off range', 'float number is out of range', 'invalid number format']}
							/>
						</Grid>
						<Grid className={classes.fixedHeight} item>
							<CustomSelect
								id="secondOperator"
								select
								value={this.state.secondOperator}
								onChange={this.handleChangeSecondOperator}
								variant="outlined"
							>
								{operators.map(item => (
									<MenuItem key={item.value} value={item.value}>
										{item.label}
									</MenuItem>
								))}
							</CustomSelect>
						</Grid>
						<Grid className={classNames(classes.flex1, classes.fixedHeight)} item>
							<TextValidator
								name="third-operand"
								id="third-operand" 
								variant="outlined"
								autoComplete="off"
								label="Enter third operand"
								className={classes.w100}
								value={this.state.thirdOperand} 
								onChange={this.onChangeThirdOperand}
								validators={['required', 'range', 'float', 'pattern']}
								errorMessages={['this field is required', 'this field is out off range', 'float number is out of range', 'invalid number format']}
							/>
						</Grid>
						<Grid className={classNames(classes.fixedHeight)} item>
							<Typography variant="h3">
								)
							</Typography>
						</Grid>
						<Grid className={classes.fixedHeight} item>
							<CustomSelect
								id="thirdOperator"
								select
								value={this.state.thirdOperator}
								onChange={this.handleChangeThirdOperator}
								variant="outlined"
							>
								{operators.map(item => (
									<MenuItem key={item.value} value={item.value}>
										{item.label}
									</MenuItem>
								))}
							</CustomSelect>
						</Grid>
						<Grid className={classNames(classes.flex1, classes.fixedHeight)} item>
							<TextValidator
								name="fourth-operand"
								id="fourth-operand" 
								variant="outlined"
								autoComplete="off"
								label="Enter fourth operand"
								className={classes.w100}
								value={this.state.fourthOperand} 
								onChange={this.onChangeFourthOperand}
								validators={['required', 'range', 'float', 'pattern']}
								errorMessages={['this field is required', 'this field is out off range', 'float number is out of range', 'invalid number format']}
							/>
						</Grid>
					</Grid>
					<Paper className={classNames(classes.root, classes.typography)} align="center" elevation={1}>
						<Typography variant="h6">
							{this.formatNumber(this.state.answer)}
						</Typography>
					</Paper>
					<FormControl style={{marginTop: '2rem'}} component="fieldset">
						<FormLabel>Rounding</FormLabel>
						<RadioGroup
							row
							name="color"
							aria-label="color"
							value={this.state.rounding}
							onChange={this.handleChangeRounding}
						>
							<FormControlLabel value="math" control={<Radio />} label="math" />
							<FormControlLabel value="banking" control={<Radio />} label="banking" />
							<FormControlLabel value="truncation" control={<Radio />} label="truncation" />
						</RadioGroup>
					</FormControl>
					<Paper className={classNames(classes.root)} align="center" elevation={1}>
						<Typography variant="h6">
							{this.formatNumber(this.state.roundAnswer)}
						</Typography>
					</Paper>
					<Button 
						type="submit"
						variant="contained" 
						color="primary" 
						className={classNames(classes.button, this.state.answer ? classes.buttonSuccess : '')}
					>
						Calculate
					</Button>
					<LinearProgress style={{visibility: this.state.loading ? 'visible' : 'hidden'}} color="secondary" variant="query"/>
				</ValidatorForm>
				<div className="contact">
					<Typography variant="h4" gutterBottom>
						Бутырчик Андрей Дмитриевич<br/> 3 курс 13 группа<br/> 2018 г.
					</Typography>
				</div>
			</div>
		);
	}
}

App.propTypes = {
	classes: PropTypes.object.isRequired
};

const styles =  theme => ({
	root: {
		...theme.mixins.gutters(),
		paddingTop: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 2,
		color: green[600],
		'&$checked': {
			color: green[500],
		},
		checked: {},
	},
	typography: {
		marginTop: theme.spacing.unit * 8,
		height: '3.2rem',
		useNextVariants: true
	},
	button: {
		marginTop: theme.spacing.unit,
		width: '100%'
	}, 
	buttonSuccess: {
		backgroundColor: green[500],
		'&:hover': {
			backgroundColor: green[700],
		},
	},
	form: {
		width: '80%'
	},
	flex1: {
		flex: 1
	},
	w100: {
		width: '100%'
	},
	fixedHeight: {
		height: '4rem'
	}
	
});

export default withStyles(styles)(App);