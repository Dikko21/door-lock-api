const { MongoClient, ServerApiVersion } = require('mongodb');
const username = 'admin'
const password = 'admin123'
const uri = `mongodb+srv://${username}:${password}@kocin.kpybkeo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const express = require('express');
const app = express();
const port = 3000;

app.get('/test', async (req, res) => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
    res.send({ message: 'Pinged your deployment. You successfully connected to MongoDB!' })
});

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