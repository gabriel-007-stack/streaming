import { Request, Response } from "express";

interface Query {
    sig: string;
    range?: string;
    dur?: string;
    id?: string;
    clean?: string;
    c: "WEB" | "MOBILE" | "TV";
}

export const createHandle = (isInit = false) => {
    return async function (req: Request, res: Response) {
        const { range, id } = req.query as unknown as Query;
        if(!id){
            res.sendStatus(403)
            return
        }
        // Fetch the video from Firebase Storage
        const url = `https://firebasestorage.googleapis.com/v0/b/app-inner.appspot.com/o/${encodeURIComponent(id)}.mp4?alt=media`;

        try {
            const response = await fetch(url, {
                headers: {
                    ...(range ? { 'Range': range } : {}),
                }
            });

            if (!response.ok) {
                return res.status(response.status).end()
            }

            const contentLength = response.headers.get('Content-Length') ?? '';
            const contentRange = response.headers.get('Content-Range') ?? '';

            res.setHeader("Content-Type", "video/mp4");

            res.setHeader('Content-Length', contentLength);
            res.status(200); // OK

            const reader = response.body?.getReader();

            if (reader) {
                const readStream = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            res.end();
                            break;
                        }
                        res.write(value);
                    }
                };

                readStream().catch((err) => {
                    console.error('Stream error:', err);
                    res.sendStatus(500);
                });
            } else {
                res.sendStatus(500);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            res.sendStatus(500);
        }
    };
};
