const http = require('http');

const server = http.createServer((req, res) => {
    let content = '';

    req.on('data', data => {
        content += data;
    });


    req.on('end', () => {
        console.log('sending', content);
        res.write(content);
        res.end();
    });
});

server.listen(9090, '0.0.0.0');