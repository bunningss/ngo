import Loan from "@/lib/models/Loan";
import Member from "@/lib/models/Member";
import Savings from "@/lib/models/Savings";
import { connectDb } from "@/lib/db/connectDb";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import Staff from "@/lib/models/Staff";

export async function GET(request) {
  try {
    const { error, id } = await verifyToken(request);
    if (error)
      return NextResponse.json({ msg: "আপনি অনুমোদিত নন।" }, { status: 401 });

    await connectDb();

    const user = await Staff.findById(id);
    if (
      user.role !== "admin" &&
      user.role !== "marketing officer" &&
      user.role !== "staff"
    )
      return NextResponse.json({ msg: "আপনি অনুমোদিত নন।" }, { status: 401 });

    const [
      totalMembers,
      { totalLoans, repayableLoans, loanRepaid },
      { totalSavings },
      { currentAmountByMembers },
    ] = await Promise.all([
      Member.countDocuments(),
      Loan.aggregate([
        {
          $group: {
            _id: null,
            totalLoans: { $sum: "$loanAmount" },
            repayableLoans: { $sum: "$repayAmount" },
            loanRepaid: { $sum: "$amountPaid" },
          },
        },
      ]).then(
        (result) =>
          result[0] || { totalLoans: 0, repayableLoans: 0, loanRepaid: 0 }
      ),
      Savings.aggregate([
        {
          $group: {
            _id: null,
            totalSavings: { $sum: "$amountSaved" },
          },
        },
      ]).then((result) => result[0] || { totalSavings: 0 }),
      Member.aggregate([
        {
          $group: {
            _id: null,
            currentAmountByMembers: { $sum: "$totalSaved" },
          },
        },
      ]).then((result) => result[0] || { currentAmountByMembers: 0 }),
    ]);

    return NextResponse.json(
      {
        msg: "Data Found.",
        payload: {
          totalMembers,
          totalLoans,
          repayableLoans,
          loanRepaid,
          totalSavings,
          currentAmountByMembers,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in dashboard route:", err);
    return NextResponse.json({ msg: err.message }, { status: 500 });
  }
}