import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, paymentId, amount } = body;

        if (!email || !paymentId) {
            return NextResponse.json(
                { error: "Missing required fields (email, paymentId)" },
                { status: 400, headers: corsHeaders }
            );
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Payment Receipt - Attendance Tracker Pro',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #00E0FF; padding: 20px; text-align: center;">
                    <h1 style="color: #000; margin: 0;">Attendance Tracker</h1>
                </div>
                <div style="padding: 30px; background-color: #ffffff; color: #333;">
                    <h2 style="color: #333; margin-top: 0;">Payment Successful</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>Thank you for subscribing to <strong>Pro Access</strong>! Your payment has been successfully processed.</p>
                    
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Receipt Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                                <td style="padding: 8px 0; font-family: monospace; text-align: right;">${paymentId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Date:</td>
                                <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 1.1em; color: #00E0FF;">${amount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">Subscription:</td>
                                <td style="padding: 8px 0; text-align: right;">6 Months (Pro Access)</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p>Your subscription is now active. You can check your dashboard and settings to see your new expiry date.</p>
                    <p>If you have any questions, please reply directly to this email.</p>
                    <br>
                    <p>Best regards,<br>The Attendance Tracker Team</p>
                </div>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                    This is an automated receipt. Please retain for your records.
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, messageId: info.messageId }, { headers: corsHeaders });
    } catch (error: any) {
        console.error("Error sending receipt email:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
