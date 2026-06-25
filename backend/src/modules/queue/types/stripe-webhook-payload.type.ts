export type StripeWebhookPayload = {
  eventId: string;
  type: string;
  payload: {
    id: string;
    type: string;
    data: {
      object: {
        id: string;
        payment_intent?: string | null;
        metadata?: Record<string, string>;
      };
    };
  };
};
