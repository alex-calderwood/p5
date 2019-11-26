// Following tutorial https://www.youtube.com/watch?v=khLCJBeYNmY&list=PLlcnQQJK8SUhQwi7MocADlD0w3rf8M0B9&index=10

// Start the listener
//     node server.js
// Make a request
//     node client.js

const http = require('http');
const message = 'hello!';

const options = {
    method: 'GET',
    host: '127.0.0.1',
    port: 9090,
    path: '/',
    headers: {
        'content-type': 'text/plain',
        'content-length': message.length
    }
};

const request = http.request(options, response => {
    let content = '';

    response.on('data', data => {
        content += data;
    });

    response.on('end', () => {
        console.log(content);
    });
});

request.write(message);
request.end()