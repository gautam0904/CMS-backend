import "reflect-metadata";
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import container from './config/inversify.config';
import { connecrtDb } from './DB';
import { MSG, errMSG } from './Constans/message'
import dotenv  from 'dotenv';
import multer from "multer";
import cors from 'cors';

dotenv.config();

const server = new InversifyExpressServer(container)

server.setConfig((app: express.Application) => {
    app.use(express.json());
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({
        origin: '*',
        credentials : true
    }))
});

const upload = multer({ dest: 'uploads/' });
const app = server.build();

connecrtDb().then(() =>{
    app.listen(process.env.port, () => {
        console.log(MSG.serverlisten ,process.env.port);
    });
}).catch((e) => {
    console.log(errMSG.connectDB,e);
})
