import express from "express"
import { createHandle } from "./handles"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from "./config";


const app = express()
app.use(express.json());

app.get("/playbackvideo", createHandle())
app.get("/initplayback", createHandle(true))

// app.get("/create-token", (req, res) => {

//     const { videoid } = req.query
//     const time = 1000 * 60 * 60

//     const token = jwt.sign({ videoid }, SECRET_KEY, { expiresIn: '1h', audience: "qs" });

//     res.send({
//         token,
//         time
//     })
// })

app.use("*", (r, e) => e.status(404).send("not found"))

export default app

app.listen(8764, () => console.log("opened"))