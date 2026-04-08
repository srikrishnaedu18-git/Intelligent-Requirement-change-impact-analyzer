import mongoose from "mongoose";

const traceabilityLinkSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      required: true
    },
    codeModule: {
      type: String,
      required: true,
      trim: true
    },
    testCase: {
      type: String,
      required: true,
      trim: true
    },
    coverageStatus: {
      type: String,
      enum: ["Covered", "Partial", "Orphan"],
      default: "Covered"
    }
  },
  {
    timestamps: true
  }
);

const TraceabilityLink = mongoose.model(
  "TraceabilityLink",
  traceabilityLinkSchema
);

export default TraceabilityLink;
