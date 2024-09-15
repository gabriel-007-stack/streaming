import express from "express"
import { bucket, createHandle, Query } from "./handles"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from "./config";


const app = express()
app.use(express.json());

app.get("/playbackvideo", createHandle())
app.get("/initplayback", createHandle(true))

app.get("/create-token", async (req, res) => {
    const time = 3600
    const { id, c, mineType = 'video/mp4' } = req.query as unknown as Query;
    const filePath = `${id}.mp4`
    const file = bucket.file(filePath);
    const expires = new Date(new Date().getTime() + time * 1000) // 1 hora
    const url = await file.getSignedUrl({
        action: 'read',
        version: c === "MOBILE" ? 'v2' : "v4",
        expires
    });
    res.set('Cache-Control', 'public, max-age=' + (time))
    res.setHeader('Expires', new Date(Date.now() + time * 1000).toUTCString());
    res.json(
        {
            url,
            expires,
            time
        }
    )
    return
})

app.use("*", (r, e) => e.status(404).send("not found"))

export default app

app.listen(8764, () => console.log("opened"))