import express from "express"
import { createHandle, Query } from "./handles"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from "./config";


const app = express()
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir qualquer origem, ajuste conforme necessário
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
});
app.get("/playbackvideo", createHandle())
app.get("/initplayback", createHandle(true))

app.get("/create-token", async (req, res) => {
    const time = 3600 * 24; 
    const { id, c, mineType = 'video/mp4' } = req.query as unknown as { id: string, c?: string, mineType?: string };

    if (!id) {
        return res.status(400).json({ error: 'Missing file ID' });
    }

    const filePath = `${id}.mp4`;
    const url = ""
    const expires = new Date(new Date().getTime() + time * 1000);

    try {

        res.set('Cache-Control', `public, max-age=${time}`);
        res.setHeader('Expires', expires.toUTCString());

        res.json({
            url,
            expires: expires.toISOString(),
            time
        });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ error: 'Failed to generate signed URL' });
    }
});

app.use("*", (r, e) => e.status(404).send("not found"))

export default app

app.listen(8764, () => console.log("opened"))