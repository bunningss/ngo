import Savings from "@/lib/models/Savings";
import { connectDb } from "@/lib/db/connectDb";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

// Fetch single savings data
export async function GET(request, { params }) {
  try {
    await connectDb();
    await verifyToken(request, "view:saving");

    const savings = await Savings.findById(params.id)
      .populate("owner", "name phone memberNumber")
      .populate("approvedBy", "name")
      .lean();

    return NextResponse.json(
      { msg: "Data Found", payload: savings },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ msg: err.message }, { status: 400 });
  }
}
