import mongoose from "mongoose";
import Member from "@/lib/models/Member";
import Loan from "@/lib/models/Loan";
import { connectDb } from "@/lib/db/connectDb";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import {
  generateLoanInstallments,
  generateSavingsName,
  setTimezone,
} from "@/utils/helpers";
import { updateDailyBalance } from "@/utils/update-daily-balance";

// create new loan
export async function POST(request) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = await verifyToken(request, "add:loan");

    const body = await request.json();

    const existingMember = await Member.findById(body.owner);
    if (!existingMember)
      return NextResponse.json(
        { msg: "দুঃখিত। সদস্য পাওয়া যায়নি" },
        { status: 400 }
      );

    // Check if the member already has an incomplete loan
    const incompleteLoan = await Loan.findOne({
      owner: existingMember._id,
      loanStatus: "incomplete",
    });

    if (incompleteLoan) {
      return NextResponse.json(
        {
          msg: "দুঃখিত। সদস্যের একটি অসম্পূর্ণ ঋণ রয়েছে।",
        },
        { status: 400 }
      );
    }

    // verify loan amount
    if (existingMember.totalSaved * 5 < body.loanAmount) {
      return NextResponse.json(
        {
          msg: `দুঃখিত। সর্বোচ্চ ঋণ পাবে ${existingMember.totalSaved * 5} টাকা`,
        },
        { status: 400 }
      );
    }

    let loanName;

    do {
      loanName = generateSavingsName();
    } while (await Loan.findOne({ owner: body.owner, loanName: loanName }));

    // Generate user installments
    const installments = generateLoanInstallments(
      new Date(body.startDate).toISOString(),
      body.loanType,
      parseInt(body.loanDuration),
      parseInt(body.loanAmount)
    );

    const rate = body.loanType === "daily" ? 32 : 20;

    const newLoan = new Loan({
      loanName,
      loanStatus: "incomplete",
      loanType: body.loanType,
      rate,
      loanAmount: body.loanAmount,
      repayAmount: installments[0].totalAmount,
      loanDuration: body.loanDuration,
      startDate: setTimezone(body.startDate),
      endDate: installments.at(-1).date,
      owner: body.owner,
      installments,
      installmentAmount: installments[0].amount,
      amountPaid: 0,
      approvedBy: id,
    });

    await Member.findByIdAndUpdate(
      body.owner,
      {
        $push: { loans: newLoan._id },
      },
      {
        new: true,
        session,
      }
    );

    await newLoan.save({ session });
    await updateDailyBalance("minus", body.loanAmount, body.startDate, session);

    await session.commitTransaction();

    return NextResponse.json(
      { msg: "নতুন ঋণ সফলভাবে তৈরি হয়েছে", payload: newLoan._id },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    return NextResponse.json({ msg: err.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
