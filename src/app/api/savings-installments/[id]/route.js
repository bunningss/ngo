import Member from "@/lib/models/Member";
import Staff from "@/lib/models/Staff";
import { connectDb } from "@/lib/db/connectDb";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

export async function GET(request, { params }) {
  try {
    await connectDb();

    const { error, id } = await verifyToken(request);
    if (error)
      return NextResponse.json({ msg: "আপনি অনুমোদিত নন।" }, { status: 401 });

    const user = await Staff.findById(id);
    if (user.role !== "admin" && user.role !== "marketing officer")
      return NextResponse.json({ msg: "আপনি অনুমোদিত নন।" }, { status: 401 });

    const member = await Member.aggregate([
      { $match: { nidNumber: params.id } },
      {
        $lookup: {
          from: "savings",
          localField: "savings",
          foreignField: "_id",
          as: "savings",
        },
      },
      {
        $addFields: {
          savings: {
            $filter: {
              input: "$savings",
              as: "savingsItem",
              cond: { $eq: ["$$savingsItem.savingsStatus", "incomplete"] },
            },
          },
        },
      },
      {
        $addFields: {
          savings: {
            $map: {
              input: "$savings",
              as: "savingsItem",
              in: {
                _id: "$$savingsItem._id",
                savingsName: "$$savingsItem.savingsName",
                savingsType: "$$savingsItem.savingsType",
                savingsAmount: "$$savingsItem.savingsAmount",
                savingsDuration: "$$savingsItem.savingsDuration",
                startDate: "$$savingsItem.startDate",
                endDate: "$$savingsItem.endDate",
                savingsStatus: "$$savingsItem.savingsStatus",
                amountSaved: "$$savingsItem.amountSaved",
                installments: {
                  $filter: {
                    input: "$$savingsItem.installments",
                    as: "installment",
                    cond: { $eq: ["$$installment.status", "unpaid"] },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (!member.length) {
      return NextResponse.json({ msg: "No data found." }, { status: 404 });
    }

    return NextResponse.json(
      { msg: "Data Found.", payload: member[0] },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ msg: err.message }, { status: 400 });
  }
}