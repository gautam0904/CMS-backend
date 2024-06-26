import mongoose from "mongoose";
import { errMSG } from "../Constans/message";

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true ,errMSG.required('Title')],
    },
    description: {
        type: String,
        required: [true ,errMSG.required('Description')]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedby : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    midea : {
        type: String,
        required:  [true ,errMSG.required('midea')]
    },
    mideaType : {
        type : String,
        required :  [true ,errMSG.required('mideaType')]
    }
});


const Content = mongoose.model('Content' , contentSchema)

export default Content