import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


    // Configuration
    cloudinary.config({ 
        cloud_name: "dcvx4tnwp", 
        api_key: "596258636375658", 
        api_secret: "PBWzlNAuSmudhmV7BpGB-KHFk3k" 
    });
    
    const uploadOnCloudinary = async (localpath : string)=>{
        try {
            if (!localpath) return null ;
            const response = await cloudinary.uploader.upload(localpath,{
                resource_type : 'auto'
            });
            if (response) {
                fs.unlinkSync(localpath);
                console.log("file is upload on cloudinary", response.url);
            }
            return response;
        } catch (error) {
            fs.unlinkSync(localpath)
            return null;
        }
    
    } 

    // const deleteonCloudinary = async (publicId : string)=>{
    //     try {
    //         if (!publicId) return null ;
    //         const response = await cloudinary.uploader.destroy(publicId);
    //         if (response) {
    //             console.log("file is delete on cloudinary");
    //         }
    //         return response;
    //     } catch (error) {
    //         return null;
    //     }

    //     cloudinary.uploader
    //     .destroy('docs/vegetables')
    //     .then(result => console.log(result));
    // }
    
    export {uploadOnCloudinary}