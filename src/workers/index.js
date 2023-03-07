const path = require('node:path');
const {Worker} = require('node:worker_threads');
const curlWorkerPath = path.join(__dirname, './curl.worker.js');

const curlPromises = (curlCommand) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(curlWorkerPath, {
            workerData: {
                curlCommand,
            },
        });

        setTimeout(() => {
            reject(new Error('Timeout'));
        }, 60 * 1000);

        worker.on('message', (result) => {
            resolve(result);
        });

        worker.on('error', (error) => {
            reject(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(
                    new Error(`Worker stopped with exit code ${code}`),
                );
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
};

module.exports = {
    curlPromises,
};
