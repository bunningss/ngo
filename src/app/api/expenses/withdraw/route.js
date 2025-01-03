import mongoose from "mongoose";
import Withdrawal from "@/lib/models/Withdrawal";
import Member from "@/lib/models/Member";
import Staff from "@/lib/models/Staff";
import { connectDb } from "@/lib/db/connectDb";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { updateDailyBalance } from "@/utils/update-daily-balance";
import { formatDate, setTimezone } from "@/utils/helpers";

// New Withdrawal
export async function POST(request) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = await verifyToken(request, "add:withdrawal");

    const { amount, userId, comment, date } = await request.json();

    if (!Number(amount))
      return NextResponse.json({ msg: "টাকার পরিমান ভুল" }, { status: 400 });

    if (amount <= 0)
      return NextResponse.json({ msg: "টাকার পরিমান ভুল" }, { status: 400 });

    const member = await Member.findById(userId);
    if (!member)
      return NextResponse.json(
        { msg: "সদস্য নির্বাচন সঠিক নয়" },
        { status: 400 }
      );

    if (member.totalSaved < amount)
      return NextResponse.json(
        { msg: "একাউন্ট এ যথেষ্ট পরিমান টাকা নেই" },
        { status: 400 }
      );

    const newWithdrawal = new Withdrawal({
      amount,
      owner: userId,
      comment,
      approvedBy: id,
      withdrawalDate: setTimezone(date),
    });

    member.totalSaved -= amount;
    member.withdrawals.push(newWithdrawal._id);

    await member.save({ session });
    await newWithdrawal.save({ session });
    await updateDailyBalance("minus", amount, date, session);

    await session.commitTransaction();

    return NextResponse.json(
      { msg: "টাকা উত্তোলন সম্পন্ন হয়েছে" },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    return NextResponse.json({ msg: err.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}

// Get all withdrawals
export async function GET(request) {
  try {
    await connectDb();
    await verifyToken(request, "view:withdrawals");

    const reqUrl = new URL(request.url);
    const date = reqUrl.searchParams.get("date");

    let query = {};
    const { startOfDay, endOfDay } = formatDate(date);
    query.createdAt = { $gte: startOfDay, $lte: endOfDay };

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .populate("owner", "name memberNumber phone")
      .populate("approvedBy", "name")
      .lean();

    return NextResponse.json(
      { msg: "Data Found.", payload: withdrawals },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ msg: err.message }, { status: 400 });
  }
}
