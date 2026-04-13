import { logger } from "../logger";

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id?: string;
    custom_id?: string;
    amount: { currency_code: string; value: string };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
  payer?: {
    email_address?: string;
    payer_id?: string;
  };
  links?: Array<{ href: string; rel: string; method: string }>;
}

let _cachedToken: string | null = null;
let _tokenExpiry = 0;

function getBaseUrl(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  if (clientId.startsWith("sb-") || clientId.startsWith("A")) {
    return "https://api-m.sandbox.paypal.com";
  }
  return "https://api-m.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const errorText = await res.text();
    logger.error({ status: res.status, body: errorText }, "PayPal token request failed");
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = (await res.json()) as PayPalTokenResponse;
  _cachedToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _cachedToken;
}

async function paypalFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    logger.error({ status: res.status, path, body: errorText }, "PayPal API error");
    throw new Error(`PayPal API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function createPayPalOrder(params: {
  planName: string;
  amountUsd: number;
  orgId: number;
  plan: string;
  billingCycle: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalOrder> {
  const order = await paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `org_${params.orgId}_${params.plan}_${params.billingCycle}`,
          description: `NexsusHR ${params.planName} Plan (${params.billingCycle})`,
          amount: {
            currency_code: "USD",
            value: params.amountUsd.toFixed(2),
          },
          custom_id: JSON.stringify({
            orgId: params.orgId,
            plan: params.plan,
            billingCycle: params.billingCycle,
          }),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "NexsusHR",
            locale: "en-US",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
          },
        },
      },
    }),
  });

  logger.info({ orderId: order.id, orgId: params.orgId, plan: params.plan }, "PayPal order created");
  return order;
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalOrder> {
  const result = await paypalFetch<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });

  logger.info({ orderId, status: result.status }, "PayPal order captured");
  return result;
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>(`/v2/checkout/orders/${orderId}`);
}
