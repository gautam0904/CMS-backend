import { BaseMiddleware } from "inversify-express-utils";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: Function) {
    console.log(req);
    console.log(file);
    cb(null, "./public/Temp");
  },
  filename: function (reqm, file, cb) {
    console.log(reqm);
    cb(null, file.originalname);
  }
});

export const upload = multer({
  storage
});
