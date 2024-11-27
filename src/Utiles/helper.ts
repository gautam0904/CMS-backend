import { statuscode } from "../Constans/stacode";
import { ApiError } from "./apiError";
import { uploadOnCloudinary } from "./cloudinary";
import { injectable } from 'inversify';

@injectable()
export class Helper {
  async uploadMedia(media: string) {
    const mideacloudinary = await uploadOnCloudinary(media);
    if (!mideacloudinary.success) {
      throw new ApiError(statuscode.NOTACCEPTABLE, mideacloudinary.message);
    }
    return mideacloudinary.data;
  }

  getMediaType(uploadFileUrl: string) {
    const resourceType = uploadFileUrl.split('/')[1];
    const format = uploadFileUrl.split('.').pop();
    return `${resourceType}/${format}`;
  }


}