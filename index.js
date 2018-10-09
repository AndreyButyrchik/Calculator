const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('APLGTR-QP68AGK3HQ');


app.post('/calculate', async (req, res) => {
	const {lOperand, operator, rOperand} = req.body;
	const answer = await waApi.getFull(`N[${lOperand} ${operator} ${rOperand}]`);
	res.send(answer);
});

app.listen(3000, () => {
	console.log('Server is running...');
});