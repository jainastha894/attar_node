import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      required: true,
      enum: ["general", "customer", "order", "wholesale"]
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "resolved", "archived"],
      default: "new"
    },
    notes: {
      type: String,
      default: ""
    },
    contactedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);

