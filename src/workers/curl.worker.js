const path = require('path');
const {workerData, parentPort} = require('worker_threads');
const {curlCommand} = workerData;
const exec = require('child_process').exec;

exec(curlCommand, function (error, stdout, stderr) {
    console.log(`🚀  curl:`, stdout);
    console.log('stderr: ' + stderr);
    let result = {
        error: true,
        message: 'Unknown message',
    };

    if (error) {
        result = {
            error: true,
            response: stdout,
        };
    }

    result = {
        error: false,
        response: stdout,
    };

    return parentPort.postMessage(result);
});
