import { Request, Response } from "express";
import * as admin from 'firebase-admin';
import path from "path";

const serviceAccountPath = path.join(__dirname, '../KYwggSiA.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: 'app-inner.appspot.com'
});

export const bucket = admin.storage().bucket();

export interface Query {
    sig: string;
    range?: string;
    dur?: string;
    id?: string;
    clean?: string;
    mineType: string;
    c: "WEB" | "MOBILE" | "TV";
}

export const createHandle = (isInit = false) => {
    return async function (req: Request, res: Response) {
        res.sendStatus(203)
    };
};
