import express from "express";
import db from "../db/conn.mjs";
import moment from 'moment';

const router = express.Router();

// Logging history
router.get("/log/id/:id", async (req, res) => {
    let collection = await db.collection("user");
    let query = { id: req.params.id };
    let userData = await collection.find(query).toArray();
    let status = 'unknown';
    let currentDay = moment().add(7, 'hours').day();
    let currentHour = moment().add(7, 'hours').hours();
    let currentSchedule = '00';

    if (userData.length > 0) {
        if (currentHour > 6 && currentHour < 12) currentSchedule = currentDay + '1'
        else if (currentHour > 11 && currentHour < 17) currentSchedule = currentDay + '2'
        else currentSchedule = currentDay + '3'

        if (!userData.some(x => x.username == 'master')) {
            if (userData.some(x => x.schedule == currentSchedule)) status = 'guru jadwal'
            else status = 'guru pengganti'
        } else status = 'master'
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
    let userData = await collection.find(query).toArray();
    let currentDay = moment().add(7, 'hours').day();
    let currentHour = moment().add(7, 'hours').hours();
    let currentSchedule = '00';

    if (userData.length == 0) res.status(404).send("Not found");
    else if (userData.some(x => x.username == 'master')) res.status(303).send({ status: 0 });
    else {
        if (currentHour > 6 && currentHour < 12) currentSchedule = currentDay + '1'
        else if (currentHour > 11 && currentHour < 17) currentSchedule = currentDay + '2'
        else currentSchedule = currentDay + '3'

        if (userData.some(x => x.schedule == currentSchedule)) {
            let log = await db.collection("log_history");
            let newDocument = {
                userId: req.params.id,
                loginDate: new Date(),
                status: 'guru jadwal'
            }
            let result = await log.insertOne(newDocument);
            res.status(202).send(result);
        } else {
            res.status(401).send("Unauthorized");
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
// router.get("/editUser/username/:username/id/:id/schedule/:schedule", async (req, res) => {
//     let collection = await db.collection("user");
//     const filter = { id: req.params.id };
//     let newDocument = {
//         $set: {
//             username: req.params.username,
//             schedule: req.params.schedule
//         }
//     }
//     let result = await collection.updateOne(filter, newDocument);
//     res.send(result);
// });

export default router;