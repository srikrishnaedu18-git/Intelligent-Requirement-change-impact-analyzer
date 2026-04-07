import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    reqId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Draft", "Approved", "Implemented"],
      default: "Draft"
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Requirement = mongoose.model("Requirement", requirementSchema);

export default Requirement;
