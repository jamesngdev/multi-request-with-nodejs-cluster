const fs = require('fs');
const path = require('path');
const axios = require('axios')
const curlTemplate = fs.readFileSync(path.join(__dirname, './template.curl'), 'utf-8')


const REPLACEMENT_VARIABLES = {
    cookie: '[[@cookie]]',
    header: '[[@header]]',
    email: '[[@email]]',
};

const deriveHeaderCookie = (cookies = []) => {
    return cookies.reduce((result, cookie) => {
        result += `${cookie.name}=${cookie.value}; `;
        return result;
    }, '')
};

const deriveHeader = (headers = []) => {
    return Object.entries(headers).reduce((result, [key, value]) => {
        result += `-H '${key}: ${value}' `;
        return result;
    }, '')
};

const generateCurl = (task, email) => {
    const cookie = deriveHeaderCookie(task.cookie);
    const header = deriveHeader(task.headers);
    const curlCommand = curlTemplate
        .replace(REPLACEMENT_VARIABLES.header, header)
        .replace(REPLACEMENT_VARIABLES.cookie, cookie)
        .replace(REPLACEMENT_VARIABLES.email, email);
    return curlCommand
}

const getTask = () => {
    const TASK_API = 'https://orders.j3n0st.us/cookies'
    return axios.get(TASK_API).then(res => res.data.value).catch(() => null)
}

module.exports = {
    generateCurl,
    getTask
}
