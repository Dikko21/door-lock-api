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
    res.send(result).status(200);
});

// Checking user permisssion
router.get("/login/id/:id", async (req, res) => {
    let collection = await db.collection("user");
    let query = { id: req.params.id };
    let userData = await collection.findOne(query);
    if (!userData) res.send("Not found").status(404);
    else if (userData.username == 'master') res.send({ status: 0 }).status(303);
    else {
        let currentDay = new Date().getDay()
        let currentHour = new Date().getHours()

        if (userData.schedule[0] != currentDay) res.send({ status: 2 }).status(401);
        else {
            if (userData.schedule[1] == '1') {
                if (currentHour > 6 && currentHour < 12) {
                    let log = await db.collection("log_history");
                    let newDocument = {
                        userId: req.params.id,
                        loginDate: new Date()
                    }
                    let result = await log.insertOne(newDocument);
                    res.send({ status: 1, ...result }).status(202);
                } else res.send({ status: 2 }).status(401);
            } else {
                if (currentHour > 11 && currentHour < 17) {
                    let log = await db.collection("log_history");
                    let newDocument = {
                        userId: req.params.id,
                        loginDate: new Date()
                    }
                    let result = await log.insertOne(newDocument);
                    res.send({ status: 1, ...result }).status(202);
                } else res.send({ status: 2 }).status(401);
            }
        }
    }
});

// Add a new document to the user collection
router.get("/createUser/username/:username/id/:id/schedule/:schedule", async (req, res) => {
    let collection = await db.collection("user");
    let newDocument = req.params
    let result = await collection.insertOne(newDocument);
    res.send(result).status(200);
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
    res.send(result).status(200);
});

export default router;