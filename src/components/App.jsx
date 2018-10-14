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

import './style.scss';
import { withStyles } from '@material-ui/core';
import {Decimal} from 'decimal.js';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			operator: '+',
			leftOperand: '',
			rightOperand: '',
			loading: false,
			answer: '',
			cheatMode: 'false'
		};

		this.handleChangeOperator = this.handleChangeOperator.bind(this);
		this.onChangeRightOperand = this.onChangeRightOperand.bind(this);
		this.onChangeLeftOperand = this.onChangeLeftOperand.bind(this);
		this.calculate = this.calculate.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.formatNumber = this.formatNumber.bind(this);
		this.NumberFormatCustom = this.NumberFormatCustom.bind(this);
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
			const reg = new RegExp(/^(\d+\s?)+(,\d+)*(\.\d+)?$/);
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

	handleChangeOperator(event) {
		this.setState({
			operator: event.target.value
		});
	}

	onChangeRightOperand(event) {
		this.setState({
			rightOperand: event.target.value
		});
	}

	formatNumber (x) {
		return x  && x !== 'Dividing by zero is impossible' ? parseFloat(x.replace(/\s/g, '')).toLocaleString().replace(',', '.') : x;
	}

	onChangeLeftOperand(event) {
		this.setState({
			leftOperand: event.target.value
		});
	}

	async calculate() {
		if(this.state.cheatMode === 'true') {
			await this.setState({
				answer: ''
			});
			const body = JSON.stringify(
				{
					lOperand: this.state.leftOperand.replace(',', '.'),
					operator: this.state.operator, 
					rOperand: this.state.rightOperand.replace(',', '.')
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
			const lOperand = new Decimal(this.state.leftOperand.replace(',', '.').replace(/\s/g, ''));
			const rOperand = new Decimal(this.state.rightOperand.replace(',', '.').replace(/\s/g, ''));
			let answer;
			switch (this.state.operator) {
				case '+':
					answer = lOperand.plus(rOperand);
					break;
				case '-':
					answer = lOperand.minus(rOperand);
					break;
				case '*':
					answer = lOperand.mul(rOperand);
					break;
				case '/':
					if (rOperand.equals(new Decimal('0'))) {
						answer = 'Dividing by zero is impossible';
					} else {
						answer = lOperand.dividedBy(rOperand).mul(new Decimal('100')).round().dividedBy(new Decimal('100'));
					}
					break;
				default:
					break;
			}
			this.setState({
				answer: answer.toString()
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
				<div className="cheat">
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
				</div>
				<CssBaseline />
				<ValidatorForm
					onSubmit={this.calculate}
					className={classes.form}
				>
					<Grid container alignItems="center" spacing={16}>
						<Grid className={classNames(classes.flex1, classes.fixedHeight)} item>
							<TextValidator
								type="text"
								name="left-operand"
								id="left-operand" 
								variant="outlined"
								label="Enter left operand"
								autoComplete="off"
								className={classes.w100}
								value={this.state.leftOperand} 
								onChange={this.onChangeLeftOperand}
								validators={['required', 'range', 'float', 'pattern']}
								errorMessages={['this field is required', 'this field is out off range', 'float number is out of range', 'invalid number format']}
							/>
						</Grid>
						<Grid className={classes.fixedHeight} item>
							<CustomSelect
								id="operator"
								select
								value={this.state.operator}
								onChange={this.handleChangeOperator}
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
								name="right-operand"
								id="right-operand" 
								variant="outlined"
								autoComplete="off"
								label="Enter right operand"
								className={classes.w100}
								value={this.state.rightOperand} 
								onChange={this.onChangeRightOperand}
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