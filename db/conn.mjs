import { MongoClient } from "mongodb";

const username = 'admin'
const password = 'admin123'
const uri = `mongodb+srv://${username}:${password}@kocin.kpybkeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

let conn;
try {
    conn = await client.connect();
} catch (e) {
    console.error(e);
}

let db = conn.db("doorlock");

export default db;