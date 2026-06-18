import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const SHOPIFY_STORE_NAME = process.env.SHOPIFY_STORE_NAME;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const plans: Record<string, { name: string; price: number; shopifyProductId: string }> = {
  basic: { 
    name: 'الخطة الأساسية', 
    price: 99,
    shopifyProductId: process.env.SHOPIFY_BASIC_PLAN_ID || 'gid://shopify/Product/1'
  },
  professional: { 
    name: 'الخطة الاحترافية', 
    price: 299,
    shopifyProductId: process.env.SHOPIFY_PROFESSIONAL_PLAN_ID || 'gid://shopify/Product/2'
  },
  enterprise: { 
    name: 'الخطة المؤسسية', 
    price: 999,
    shopifyProductId: process.env.SHOPIFY_ENTERPRISE_PLAN_ID || 'gid://shopify/Product/3'
  },
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId || !plans[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (!SHOPIFY_STORE_NAME || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify configuration missing' },
        { status: 500 }
      );
    }

    const plan = plans[planId];

    // Create a checkout using Shopify's GraphQL API
    const query = `
      mutation {
        checkoutCreate(input: {
          lineItems: [
            {
              variantId: "${plan.shopifyProductId}"
              quantity: 1
            }
          ]
          customAttributes: [
            {
              key: "user_id"
              value: "${userId}"
            }
            {
              key: "plan"
              value: "${planId}"
            }
          ]
        }) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to create Shopify checkout' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 500 }
      );
    }

    const checkout = data.data?.checkoutCreate?.checkout;

    if (!checkout || !checkout.webUrl) {
      console.error('No checkout URL in Shopify response');
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      checkoutUrl: checkout.webUrl,
    });
  } catch (error) {
    console.error('Shopify create checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
