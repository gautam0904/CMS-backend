import { Request, Response } from "express";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Auth } from "../Middlewares/auth.middleware";
import { Role } from "../Middlewares/role.middleware";
import { upload } from "../Middlewares/multer.midddleware";
import { Icontent } from "../Interfaces/model.interface";
import { ContentService } from "../Services/content.service";
import { inject } from "inversify"
import { MSG } from "../Constans/message";
import { TYPES } from '../Types/types';
// const upload = multer({ dest: 'uploads/' })

const authMiddleware = new Auth
const roleMiddleware = new Role

@controller("/content", authMiddleware.handler)
export class ContenetController {

  private content: ContentService

  constructor(@inject(TYPES.ContentService) content: ContentService) {
    this.content = content;
  }


  fupload = upload.fields([{
    name: 'midea',
    maxCount: 1
  }])

  @httpPost("/create", roleMiddleware.handler,)
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
      res.status(error.statusCode || 500).json({
        message: error.message
      });
    }
  }


  @httpGet('/get', roleMiddleware.handler)
  async get(req: Request, res: Response) {
    try {
      const content = await this.content.getContent();
      res.status(content.statuscode).json(content)

    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message

      })
    }
  }
}
