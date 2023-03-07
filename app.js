const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { spawn } = require('child_process');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.post('/checkStatus', async (req, res) => {
    const input = req.body.email
    const emails = input.trim().split('\n').map(email => email.trim())

    const command = 'node';
    const args = ['processer.js', ...emails];
    const childProcess = spawn(command, args);
    let stdout = ''
    childProcess.stdout.on('data', (data) => {
        stdout+= data.toString()
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
        const result = JSON.parse(stdout)
        res.json(result)
    });
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
