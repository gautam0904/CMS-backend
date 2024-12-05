import mongoose from "mongoose";

export interface baseUserDTO {
    USERID: string,
    ROLE: string
}

export interface IcontentDTO extends baseUserDTO {
    _id?: string;
    title: string;
    description: string;
    mideaType: string;
    midea: string;
    owner: mongoose.Schema.Types.ObjectId;
    updatedby: mongoose.Schema.Types.ObjectId;
}