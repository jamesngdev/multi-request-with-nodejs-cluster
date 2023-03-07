const cluster = require('cluster');
const {generateCurl} = require("./src/services/curlGenerator");
const exec = require('child_process').exec;
const task = require('./task.json').value

const emails = process.argv.slice(2, process.argv.length - 2)

if (cluster.isMaster) {
    let processedCount = 0
    let result = {}
    let retryTimeCount = {}
    const MAX_TRY = 5

    const onWorkerMessage = (email, response) => {
        if (response.error) {
            retryTimeCount[email] = (retryTimeCount[email] || 0) + 1
            if (retryTimeCount[email] > MAX_TRY) {
                processedCount++
                result[email] = {
                    error: true,
                    response: "System error"
                }
                return
            }

            const retryWorker = cluster.fork()
            retryWorker.send(email)
            retryWorker.on('message', (message) => {
                return onWorkerMessage(message, email)
            })
        }else {
            result[email] = response
            processedCount++
            if (processedCount >= emails.length) {
                console.log(JSON.stringify(result))
            }
        }
    }

    for (const email of emails) {
        const worker = cluster.fork()
        worker.on('message', (response) => {
           return onWorkerMessage(email, response)
        })
        worker.send(email)
    }
}else{
    process.on('message', async function (email) {
        const commandLine = generateCurl(task, email)
        exec(commandLine, (err, stdout, stderr) => {
            if (err) {
                process.send({
                    error: true,
                    response: '',
                })
                return process.exit(1)
            }

            process.send({
                error: false,
                response: stdout,
            })
            process.exit(1)
        })
    });
}
