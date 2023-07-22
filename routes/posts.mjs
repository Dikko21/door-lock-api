import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

// Logging history
router.get("/log/id/:id", async (req, res) => {
    let collection = await db.collection("user");
    let query = { id: req.params.id };
    let userData = await collection.findOne(query);
    let status = 'master'
    let currentDay = new Date().getDay()
    let currentHour = new Date().getHours()
    if (userData) {
        if (userData.username != 'master') {
            if (userData.schedule[0] == currentDay) {
                if (userData.schedule[1] == '1') {
                    if (currentHour > 6 && currentHour < 12) status = 'guru jadwal'
                    else status = 'pengganti'
                } else {
                    if (currentHour > 11 && currentHour < 17) status = 'guru jadwal'
                    else status = 'pengganti'
                }
            } else status = 'pengganti'
        }
    }

    let collectionLog = await db.collection("log_history");
    let newDocument = {
        userId: req.params.id,
        loginDate: new Date(),
        status: status
    }
    let result = await collectionLog.insertOne(newDocument);
    res.status(200).send(result);
});

// Checking user permisssion
router.get("/login/id/:id", async (req, res) => {
    let collection = await db.collection("user");
    let query = { id: req.params.id };
    let userData = await collection.findOne(query);
    if (!userData) res.status(404).send("Not found");
    else if (userData.username == 'master') res.status(303).send({ status: 0 });
    else {
        let currentDay = new Date().getDay()
        let currentHour = new Date().getHours()
        console.log(currentDay)
        console.log(currentHour)
        if (userData.schedule[0] != currentDay) res.status(401).send({ status: 2 });
        else {
            if (userData.schedule[1] == '1') {
                if (currentHour > 6 && currentHour < 12) {
                    let log = await db.collection("log_history");
                    let newDocument = {
                        userId: req.params.id,
                        loginDate: new Date()
                    }
                    let result = await log.insertOne(newDocument);
                    res.status(202).send({ status: 1, ...result });
                } else res.status(401).send({ status: 2 });
            } else {
                if (currentHour > 11 && currentHour < 17) {
                    let log = await db.collection("log_history");
                    let newDocument = {
                        userId: req.params.id,
                        loginDate: new Date()
                    }
                    let result = await log.insertOne(newDocument);
                    res.status(202).send({ status: 1, ...result });
                } else res.status(401).send({ status: 2 });
            }
        }
    }
});

// Add a new document to the user collection
router.get("/createUser/username/:username/id/:id/schedule/:schedule", async (req, res) => {
    let collection = await db.collection("user");
    let newDocument = req.params
    let result = await collection.insertOne(newDocument);
    res.send(result);
});

// Add a new document to the user collection
router.get("/editUser/username/:username/id/:id/schedule/:schedule", async (req, res) => {
    let collection = await db.collection("user");
    const filter = { id: req.params.id };
    let newDocument = {
        $set: {
            username: req.params.username,
            schedule: req.params.schedule
        }
    }
    let result = await collection.updateOne(filter, newDocument);
    res.send(result);
});

export default router;