import express from "express";
import db from "../db/conn.mjs";
import { GridFSBucket } from "mongodb";
import moment from 'moment';
import upload from "../middleware/upload.js";

const router = express.Router();

// Logging history
router.get("/log/:status/id/:id", async (req, res) => {
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
            if (userData.some(x => x.schedule == currentSchedule)) status = req.params.status === '0' ? 'guru jadwal (masuk)' : 'guru jadwal (keluar)'
            else status = req.params.status === '0' ? 'guru pengganti (masuk)' : 'guru pengganti (keluar)'
        }
        else if (userData.some(x => x.username == 'button')) {
            status = req.params.status === '0' ? 'button (masuk)' : 'button (keluar)'
        }
        else status = req.params.status === '0' ? 'master (masuk)' : 'master (keluar)'
    }

    let collectionLog = await db.collection("log_history");
    let newDocument = {
        userId: req.params.id,
        loginDate: new Date(new Date().valueOf() + (7 * 60 * 60000)),
        status: status
    }
    let result = await collectionLog.insertOne(newDocument);
    res.status(200).send(result);
});

// Checking user permisssion
router.get("/login/:status/id/:id", async (req, res) => {
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
                loginDate: new Date(new Date().valueOf() + (7 * 60 * 60000)),
                status: req.params.status === '0' ? 'guru jadwal (masuk)' : 'huru jadwal (keluar)'
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

// Upload image
router.post("/createUser", async (req, res) => {
    await upload(req, res);
    console.log(req.file);

    if (req.file == undefined) {
        return res.status(400).send({
            message: "You must select a file.",
        });
    }

    let collection = await db.collection("user");
    let newDocument = { ...req.body, photo: req.file.filename }
    let result = await collection.insertOne(newDocument);
    res.send(result);
});

// Download image
router.get("/image/:imageName", async (req, res) => {
    const bucket = new GridFSBucket(db, {
        bucketName: 'photos',
    });
    let downloadStream = bucket.openDownloadStreamByName(req.params.imageName);

    downloadStream.on("data", function (data) {
        return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
        return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
        return res.end();
    });
});

// Get log history
router.get("/getLog", async (req, res) => {
    let collection = await db.collection("log_history");
    let result = await collection.aggregate([
        {
            $lookup: {
                from: 'user',
                localField: 'userId',
                foreignField: 'id',
                as: 'detail'
            }
        }
    ]).sort({ _id: -1 }).toArray();
    let data = result.map((x, idx) => {
        return {
            no: idx + 1,
            username: x.detail[0].username,
            name: x.detail[0].name,
            photo: x.detail[0].photo,
            status: x.status,
            loginDate: moment(x.loginDate).format('dddd, MMMM Do YYYY, h:mm:ss a')
        }
    })
    res.render("home", { variableName: data })
});

export default router;