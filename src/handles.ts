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

        if (rbuf == 0) {
            rbuf = 11908
        }


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

            const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/app-inner.appspot.com/o/${ei ? ei : "HDuXM48EA9MEpTwC4ZGWBHPb9xd4QKrS"}.mp4?alt=media`, { headers, signal: abort.signal, });
            //const response = await fetch(`https://rr5---sn-bg0eznze.googlevideo.com/videoplayback?expire=1728724212&ei=lOgJZ5jfBLTM2roP14Gc6Qo&ip=2001%3A4456%3Ac01%3A5d00%3Af1b8%3A7fe2%3Aeee%3A5eca&id=o-AMx5MyWawOS3at8rMIp98BNYTnur_HW2j37LQrEPwfH7&itag=136&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AXLXGFRD1lqOd1rgiGTv4k1wFUIBLN55tce02EhICul1yxjRiH5b_CwCIIXXiA9lQItAVCcFvUt4dPoy&vprv=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=12026397&dur=106.406&lmt=1712213615961934&keepalive=yes&fexp=24350655,24350673,51300760&c=MEDIA_CONNECT_FRONTEND&txp=1308224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAOTMAQ2RReb8BDULnQg_KBzv7CSbQTZKATSUrdtzrhYJAiA-xbBxdANswiP5zuGpmrFc4C5c6ARaLfQNIY1g7Do5hw%3D%3D&rm=sn-2aqu-jbtd7e,sn-2aqu-hoas77r&rrc=79,79,80&req_id=dbb08337787da3ee&cmsv=e&redirect_counter=3&cm2rm=sn-hoas7z&cms_redirect=yes&met=1728702702,&mh=YA&mip=143.137.158.22&mm=34&mn=sn-bg0eznze&ms=ltu&mt=1728702272&mv=m&mvi=5&pl=24&rms=ltu,au&lsparams=met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=ACJ0pHgwRAIgTE7vngoy-0Wk1uPYGLKEyYpkcnAIom5vMJMj0R6lE44CIAHO9n1bkOx5izZjgquWJ_zddmpPVQm5RKJGDEfzSRih${endByte !== 0 ? "" : ""}&range=${startByte + "-" + endByte}`, {});

            if (!response.ok) {
                return res.sendStatus(response.status);
            }

            const contentLength = response.headers.get('Content-Length') || '0';
            const contentRange = response.headers.get('Content-Range') || '';
            const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

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
                } else {
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
