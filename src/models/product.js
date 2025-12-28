import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    JarsAndBottles: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    industry: {
        type: String,
        required: true
    },
    capacity: String,
    height: String,
    width: String,
    weight: String,
    color: String,
    shape: String,
    neckSize: String,
    neckType: String,
    material: String,
    usage: String,
    outofstock: Boolean,
    active: Boolean,
    category:[String]
});


export default mongoose.model("Product", productSchema);