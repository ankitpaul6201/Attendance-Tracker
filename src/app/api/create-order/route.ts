import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });

        // 50 INR in subunits (paise)
        const options = {
            amount: 5000,
            currency: "INR",
            receipt: "receipt_order_1",
        };

        const order = await instance.orders.create(options);

        // Return the full order payload
        return NextResponse.json({ order }, { headers: corsHeaders });
    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}
