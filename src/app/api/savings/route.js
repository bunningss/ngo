import mongoose from "mongoose";
import Savings from "@/lib/models/Savings";
import Member from "@/lib/models/Member";
import { connectDb } from "@/lib/db/connectDb";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import {
  generateInstallments,
  generateSavingsName,
  setTimezone,
} from "@/utils/helpers";

// create new savings
export async function POST(request) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = await verifyToken(request, "add:saving");

    const body = await request.json();

    let savingsName;

    do {
      savingsName = generateSavingsName();
    } while (
      await Savings.findOne({ owner: body.owner, savingsName: savingsName })
    );

    // Generate user installments
    const installments = generateInstallments(
      new Date(body.startDate).toISOString(),
      body.savingsType,
      parseInt(body.savingsDuration),
      parseInt(body.savingsAmount)
    );

    const nomineeAge =
      new Date().getFullYear() - new Date(body.nomineeBirthDate).getFullYear();

    const newSavings = new Savings({
      savingsName,
      savingsStatus: "incomplete",
      savingsType: body.savingsType,
      savingsAmount: body.savingsAmount,
      savingsDuration: body.savingsDuration,
      startDate: setTimezone(body.startDate),
      endDate: installments.at(-1).date,
      owner: body.owner,
      installments,
      amountSaved: 0,
      approvedBy: id,
      nomineeName: body.nomineeName,
      relationWithNominee: body.relationWithNominee,
      nomineeNidNumber: body.nomineeNidNumber,
      nomineeBirthDate: setTimezone(body.nomineeBirthDate),
      nomineeAge,
      nomineeImage: body.nomineeImage,
    });

    await Member.findByIdAndUpdate(
      body.owner,
      {
        $push: { savings: newSavings._id },
      },
      {
        new: true,
        session,
      }
    );

    await newSavings.save({ session });
    await session.commitTransaction();

    return NextResponse.json(
      { msg: "নতুন সঞ্চয় সফলভাবে তৈরি হয়েছে", payload: newSavings._id },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    return NextResponse.json({ msg: err.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
