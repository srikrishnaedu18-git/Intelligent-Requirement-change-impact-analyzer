import mongoose from "mongoose";

const changeRequestSchema = new mongoose.Schema(
  {
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    proposedChange: {
      type: String,
      required: true,
      trim: true
    },
    riskLevel: {
      type: String,
      enum: ["Standard", "Normal", "Emergency"],
      default: "Standard"
    },
    impactScore: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const ChangeRequest = mongoose.model("ChangeRequest", changeRequestSchema);

export default ChangeRequest;
