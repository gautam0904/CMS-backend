import { Request, Response, NextFunction } from "express";
import { BaseMiddleware } from "inversify-express-utils";
import { ApiError } from "../Utiles";
import { statuscode } from "../Constans/stacode";
import { errMSG } from "../Constans/message";

export class Role extends BaseMiddleware {
  handler(req: Request, res: Response, next: NextFunction): void {
    try {
      const permission = {
        admin: ['/user/deleteUser', '/user/getById', `/user/update`, '/user/delete', `/content/get`, `/content/update`, `/content/delete`, `/content/getByUser`],
        creater: [`/content/get`, `/content/create`, `/content/update`, `/content/delete`, '/user/deleteUser', '/user/getById', `/user/update`, '/content/getByUser'],
        user: [`/content/get`, '/user/deleteUser', '/user/getById', `/user/update`, '/content/getByUser'],
      }

      const role = req.body.ROLE || req.headers.ROLE;

      if (!role) {
        throw new ApiError(statuscode.UNAUTHORIZED, errMSG.notValidRole('undefined'));
      }

      const currentRoute =
        req.protocol + "://" + req.get("host") + req.originalUrl;
      const parsedUrl = new URL(currentRoute);
      const pathname = parsedUrl.pathname;

      if (!permission[role as keyof typeof permission]) {
        throw new ApiError(statuscode.FORBIDDEN, errMSG.notValidRole(role));
      }

      const userPermissions = permission[role as keyof typeof permission];

      if (userPermissions.includes(pathname)) {
        next();
      } else {
        throw new ApiError(statuscode.FORBIDDEN, errMSG.notValidRole(role))
      }
    } catch (error: any) {
      console.error('Role middleware error:', error);
      res.status(error.statusCode || statuscode.NOTIMPLEMENTED).json({
        message: error.message
      })
    }
  }
}
