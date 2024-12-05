import { NextFunction, Request, Response } from "express";
import { BaseMiddleware } from "inversify-express-utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { errMSG } from "../Constans/message"
import { statuscode } from "../Constans/stacode";
import { ApiError } from "../Utiles";

export class Auth extends BaseMiddleware {
  handler(req: Request, res: Response, next: NextFunction) {
    const secretkey = process.env.AccessTokenSeceret;
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        message: errMSG.required("Access token")
      });
    }

    const tokenArray = (token as string).split(" ");

    if (tokenArray[0] !== "Bearer") {
      throw new ApiError(statuscode.UNAUTHORIZED, errMSG.required("Bearer token"));
    }

    try {
      const decoded: any = jwt.verify(tokenArray[1] as string, secretkey);
      req.body.USERID = decoded.id;
      req.body.ROLE = decoded.role;

      req.headers.USERID = decoded.id;
      req.headers.ROLE = decoded.role;

      next();
    } catch (error) {
      return res.status(statuscode.UNAUTHORIZED).json({
        message: errMSG.expiredToken
      });
    }
  }
}