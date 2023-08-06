import express from "express";
import cors from "cors";
import "express-async-errors";
import posts from "./routes/posts.mjs";
import ejs from 'ejs';

const PORT = 2121;
const app = express();

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');

// Load the /posts routes
app.use("/", posts);

// Global error handling
app.use((err, _req, res, next) => {
    console.log(err)
    res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});