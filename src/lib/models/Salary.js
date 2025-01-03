import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "staff",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Salary =
  mongoose.models?.salary || mongoose.model("salary", salarySchema);

export default Salary;
