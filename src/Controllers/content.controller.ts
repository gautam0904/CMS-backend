import { Request, Response } from "express";
import { controller, httpDelete, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { Auth } from "../Middlewares/auth.middleware";
import { Role } from "../Middlewares/role.middleware";
import { upload } from "../Middlewares/multer.midddleware";
import { Icontent } from "../Interfaces/model.interface";
import { ContentService } from "../Services/content.service";
import { inject } from "inversify"
import { MSG, errMSG } from "../Constans/message";
import { TYPES } from '../Types/types';
import { ApiError } from "../Utiles";
import { statuscode } from "../Constans/stacode";
// const upload = multer({ dest: 'uploads/' })


@controller("/content", Auth)
export class ContenetController {

  private content: ContentService

  constructor(@inject(TYPES.ContentService) content: ContentService) {
    this.content = content;
  }

  @httpPost("/create", Role, upload.fields([{
    name: 'midea',
    maxCount: 1
  }]))
  async create(req: Request, res: Response) {
    try {
      const contentData: Icontent = req.body;

      contentData.owner = contentData.updatedby = req.body.USERID;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const profilePictureLocalpath = files?.midea?.[0]?.path;
      contentData.midea = profilePictureLocalpath;


      const content = await this.content.createContent(contentData);

      res.status(content.statuscode).json(content);
    } catch (error: any) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({
        message: error.message
      });
    }
  }


  @httpGet('/get', Role)
  async get(req: Request, res: Response) {
    try {
      const content = await this.content.getContent();
      res.status(content.statuscode).json(content)

    } catch (error: any) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({
        message: error.message

      })
    }
  }

  @httpPut('/update', Role, upload.fields([{
    name: 'midea',
    maxCount: 1
  }]))
  async update(req: Request, res: Response,) {
    try {
      const updateData: Icontent = req.body as unknown as Icontent;
      updateData.owner = updateData.updatedby = req.body.USERID;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePictureLocalpath = files?.midea?.[0]?.path;
      updateData.midea = profilePictureLocalpath;

      const updated_user = profilePictureLocalpath ? await this.content.updateContentWithMidea(updateData._id, updateData) : await this.content.updateContentWithoutMidea(updateData._id, updateData)

      res.status(updated_user.statuscode).json(updated_user);
    } catch (error) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message })
    }
  }

  @httpDelete('/delete', Role)
  async delete(req: Request, res: Response) {
    try {
      const cid = req.query.id as string;
      if (!cid) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.exsistuser);
      }

      const deleted_content = await this.content.deleteContent(cid);

      res.status(deleted_content.statuscode).json(deleted_content);
    } catch (error) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }
}
