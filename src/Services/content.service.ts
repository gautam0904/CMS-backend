import { injectable } from 'inversify'
import { Icontent } from '../Interfaces/model.interface';
import { ApiError, Helper, uploadOnCloudinary, deleteonCloudinary } from '../Utiles';
import Content from '../Models/content.model';
import { MSG, errMSG } from '../Constans/message';
import mongoose from 'mongoose';
import { statuscode } from '../Constans/stacode';

@injectable()
export class ContentService {
  constructor() { }

  async getContent() {
    try {
      const result = await Content.find();
      return {
        statuscode: statuscode.OK,
        message: MSG.success("Content fetched"),
        data: result
      }
    } catch (error: any) {
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.defaultErrorMsg,
        data: error
      }
    }
  }

  async createContent(contentData: Icontent) {
    let uploadedFileUrl: string | null = null;
    try {
      const mideacloudinary = await uploadOnCloudinary(contentData.midea);

      if (!mideacloudinary.success) {
        throw new ApiError(statuscode.NOTACCEPTABLE, mideacloudinary.message);
      }
      uploadedFileUrl = mideacloudinary.data.url;
      contentData.mideaType = `${mideacloudinary.data.resource_type}/${mideacloudinary.data.format}`

      const result = await Content.create({
        title: contentData.title,
        description: contentData.description,
        mideaType: contentData.mideaType,
        midea: uploadedFileUrl,
        owner: contentData.owner,
        updatedby: contentData.updatedby
      });

      if (!result) {
        throw new ApiError(statuscode.NOTIMPLEMENTED, errMSG.notCreated("Post"));
      }

      return {
        statuscode: statuscode.OK,
        message: MSG.success("Content created"),
        data: result
      }
    } catch (error: any) {
      if (uploadedFileUrl) {
        await deleteonCloudinary(uploadedFileUrl);
      }
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.defaultErrorMsg,
        data: error
      }
    }
  }


  async updateContentWithMidea(id: string, contentData: Icontent) {
    let uploadFileUrl: string | null = null;

    try {
      const mideacloudinary = await uploadOnCloudinary(contentData.midea);
      if (!mideacloudinary.success) {
        throw new ApiError(statuscode.NOTACCEPTABLE, mideacloudinary.message);
      }
      uploadFileUrl = mideacloudinary.data.url
      contentData.mideaType = `${mideacloudinary.data.resource_type}/${mideacloudinary.data.format}`

      const oldPost = await Content.findById(id);
      if (!oldPost) {
        throw new ApiError(statuscode.NOTIMPLEMENTED, errMSG.notFound("Post"));
      }

      const oldMideaDeletion = await deleteonCloudinary(oldPost.midea);
      if (!oldMideaDeletion.success) {
        console.warn("Old media deletion failed:", oldMideaDeletion.message);
      }

      const result = await Content.findByIdAndUpdate(
        id,
        {
          title: contentData.title,
          description: contentData.description,
          midea: uploadFileUrl,
          owner: contentData.owner,
          updatedby: contentData.updatedby
        },
        { new: true }
      );

      if (!result) {
        throw new ApiError(statuscode.NOTIMPLEMENTED, errMSG.notUpdated("Post"));
      }

      return {
        statuscode: statuscode.OK,
        message: MSG.success("Content updated"),
        data: result
      };
    } catch (error: any) {
      if (uploadFileUrl) {
        await deleteonCloudinary(uploadFileUrl);
      }
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.defaultErrorMsg,
        data: error
      };
    }
  }

  async updateContentWithoutMidea(id: string, contentData: Icontent) {
    try {
      const result = await Content.findByIdAndUpdate({
        _id: new mongoose.Types.ObjectId(id)
      },
        {
          title: contentData.title,
          description: contentData.description,
          owner: contentData.owner,
          updatedby: contentData.updatedby
        });

      return {
        statuscode: statuscode.OK,
        message: MSG.success("Content updated"),
        data: result
      }
    }
    catch (error: any) {
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.defaultErrorMsg,
        data: error
      }
    }

  }

  async deleteContent(id: string) {
    try {
      const result = await Content.findByIdAndDelete(id);

      return {
        statuscode: statuscode.OK,
        message: MSG.success("Content deleted"),
        data: result
      }
    } catch (error: any) {
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.defaultErrorMsg,
        data: error
      }
    }
  }

}
