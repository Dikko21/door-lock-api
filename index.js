const express = require('express');
const app = express();
const port = 3000;

app.get('/login/:id', (req, res) => {
    console.log(req.params)
    res.send(req.params)
});

app.get('/login-master/:id', (req, res) => {
    console.log(req.params)
    res.send(req.params)
});

app.listen(port, () => {
    console.log(`listening at port ${port}`)
});