export type GetCheckoutResponse = {
  success: boolean;
  data: string | null;
  error?: string;
}

export async function getCheckout({
  priceId
}: {
  priceId: string
}) {
  try {
    if (!priceId) {
      throw new Error('Price Id is required');
    }

    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/stripe-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to creating post');
    }

    const result: GetCheckoutResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create review');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
