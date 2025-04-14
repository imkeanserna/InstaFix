import { errorResponse } from '@/lib/errorResponse';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

interface IRequestBody {
  priceId: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json() as Partial<IRequestBody>;

    if (!priceId) {
      throw new Error('Price Id is required');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_BACKEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_BACKEND_URL}/dashboard/subscription`,
    });

    return NextResponse.json({
      success: true,
      data: session.url
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Something went wrong, Try again', errorMessage);
  }
}
