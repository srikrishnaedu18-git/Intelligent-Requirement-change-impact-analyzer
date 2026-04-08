import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      required: true,
      trim: true
    },
    entityId: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      default: ""
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
