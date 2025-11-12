import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Clerk webhook handler for user sync
 *
 * Handles user.created, user.updated, and user.deleted events from Clerk.
 * Syncs essential user data to database following Clerk best practices:
 * - Store only Clerk ID and minimal data
 * - Access full user data from Clerk session token when needed
 *
 * Security: Verifies webhook signature using CLERK_WEBHOOK_SIGNING_SECRET
 * Reference: https://clerk.com/docs/webhooks/sync-data
 */
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(env.CLERK_WEBHOOK_SIGNING_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Webhook verification failed", err);
    return new Response("Error: Webhook verification failed", {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;

        // Get primary email
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          throw new Error("No primary email found");
        }

        // Create user in database
        await db.user.create({
          data: {
            clerkId: id,
            email: primaryEmail.email_address,
            name: first_name && last_name ? `${first_name} ${last_name}` : null,
            imageUrl: image_url,
          },
        });

        // User created successfully (logged for debugging webhooks)
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;

        // Get primary email
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          throw new Error("No primary email found");
        }

        // Update user in database
        await db.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail.email_address,
            name: first_name && last_name ? `${first_name} ${last_name}` : null,
            imageUrl: image_url,
          },
        });

        // User updated successfully
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        if (!id) {
          throw new Error("No user ID found");
        }

        // Delete user from database (cascade will delete related data)
        await db.user.delete({
          where: { clerkId: id },
        });

        // User deleted successfully
        break;
      }

      default:
        console.warn(`Unhandled webhook event: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error);
    return new Response(`Error processing webhook: ${error}`, { status: 500 });
  }
}
