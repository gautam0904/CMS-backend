import { injectable } from 'inversify'
import { Icontent } from '../Interfaces/model.interface';
import { uploadOnCloudinary } from '../Utiles/cloudinary';
import Content from '../Models/content.model';
import { MSG, errMSG } from '../Constans/message';

@injectable()
export class ContentService {
    constructor() { }

    async getContent() {
        try {
            const result = await Content.find();
            return {
                statuscode: 200,
                    message: MSG.success("Content fetched"),
                    data: result
            }
        } catch (error : any) {
            return {
                statuscode: error.statuscode || 500,
                    message: error.message || errMSG.defaultErrorMsg,
                    data: error
            }
        }
    }

    async createContent(contentData: Icontent) {
        try {
            const mideacloudinary = await uploadOnCloudinary(contentData.midea);

            const result = await Content.create({
                title: contentData.title,
                description: contentData.description,
                midea: mideacloudinary.url,
                owner: contentData.owner,
                updatedby: contentData.updatedby
            });

            return {
                statuscode: 200,
                    message: MSG.success("Content created"),
                    data: result
            }
        } catch (error: any) {
            return {
                statuscode: error.statuscode || 500,
                    message: error.message || errMSG.defaultErrorMsg,
                    data: error
            }
        }
    }


    async updateContentWithMidea(id: string, contentData: Icontent) {
        try {

            const mideacloudinary = await uploadOnCloudinary(contentData.midea);

            const result = await Content.findByIdAndUpdate({
                _id: id
            },
                {
                    title: contentData.title,
                    description: contentData.description,
                    midea: mideacloudinary.url,
                    owner: contentData.owner,
                    updatedby: contentData.updatedby
                });

            return {
                statuscode: 200,
                    message: MSG.success("Content updated"),
                    data: result
            }
        } catch (error: any) {
            return {
                statuscode: error.statuscode || 500,
                    message: error.message || errMSG.defaultErrorMsg,
                    data: error
            }
        }
    }

    async updateContentWithoutMidea(id: string, contentData: Icontent) {
        try {
            const result = await Content.findByIdAndUpdate({
                _id: id
            },
                {
                    title: contentData.title,
                    description: contentData.description,
                    owner: contentData.owner,
                    updatedby: contentData.updatedby
                });

            return {
                statuscode: 200,
                    message: MSG.success("Content updated"),
                    data: result
            }
        }
        catch (error: any) {
            return {
                statuscode: error.statuscode || 500,
                    message: error.message || errMSG.defaultErrorMsg,
                    data: error
            }
        }

    }

    async deleteContent (id : string){
       try {
        const result = await Content.findByIdAndDelete(id);

        return {
            statuscode: 200,
                message: MSG.success("Content deleted"),
                data: result
        }
       } catch (error : any) {
        return{
            statuscode: error.statuscode || 500,
                message: error.message || errMSG.defaultErrorMsg,
                data: error
        }
       }
    }


}
