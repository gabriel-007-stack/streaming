import { Request as R, Response } from "express";
import path from "path";


export interface Query {
    sig: string;
    range?: string;
    dur?: string;
    id?: string;
    clean?: string;
    mineType: string;
    c: "WEB" | "MOBILE" | "TV";
}

const max = 4 * 1024 * 1024
export const createHandle = (isInit = false) => {
    return async function handleRequest(req: R, res: Response) {

        let { rn, expire, source, rbuf = 0, mime, ip, ei = "", clen } = req.query as Record<string, string>




        const range = String(req.query.range ?? req.headers['range']?.replace(/^bytes?=/, ''));
        const isDisabledHeader206 = !!req.query.range
        const [start, end] = /^(\d+)-(\d+)?$/.test(range) ? range.split('-') : ['0', String(max)];
        const startByte = parseInt(start, 10);
        const endByte = end ? Math.min(+start + 4 * 1024 * 1024, parseInt(end, 10)) : 1 * 1024 * 1024;

        if (isNaN(startByte) || (endByte !== null && isNaN(endByte))) {
            return res.sendStatus(400); // Bad Request
        }

        const headers: { [key: string]: string } = {};
        if (endByte !== null) {
            headers['Range'] = `bytes=${startByte}-${endByte}`;
        }
        const abort = new AbortController
        try {

            ei = atob(ei)

            const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/app-inner.appspot.com/o/${ei ? ei : "403"}.mp4?alt=media`, { headers, signal: abort.signal, });

            if (!response.ok) {
                return res.sendStatus(response.status);
            }

            const contentLength = response.headers.get('Content-Length') || '0';
            const contentRange = response.headers.get('Content-Range') || '';
            const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

            res.setHeader('cache-control', 'private, max-age=21296');
            if (!isDisabledHeader206) {
                res.setHeader('Content-Range', contentRange);
                res.setHeader('Content-Type', contentType);
                res.status(response.status);
            } else {
                res.setHeader('Content-Type', "application/yoth.steaming");
                res.status(response.status === 206 ? 200 : response.status);
            }
            res.setHeader('Content-Length', contentLength);

            const reader = response.body?.getReader();
            if (!reader) {
                return res.sendStatus(500); // Internal Server Error
            }
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (!done) {
                    res.write(value);
                }
            }
            if (done) {
                res.end();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            res.sendStatus(500); // Internal Server Error
        }
    }
};
