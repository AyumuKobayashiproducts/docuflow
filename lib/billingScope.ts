import { supabase } from "@/lib/supabaseClient";
import { getActiveOrganizationId } from "@/lib/organizations";

export type BillingScopeType = "personal" | "organization";

export class BillingScopeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type OrgRole = "owner" | "admin" | "member";

export type BillingScope =
  | {
      type: "personal";
      customerId: string | null;
      subscriptionId: string | null;
    }
  | {
      type: "organization";
      organizationId: string;
      role: Exclude<OrgRole, "member">;
      customerId: string | null;
      subscriptionId: string | null;
    };

/**
 * 課金の対象スコープ（personal / active organization）を解決する。
 * - organization の場合は activeOrg を必須とし、owner/admin のみ許可する
 */
export async function getBillingScopeOrThrow(
  userId: string,
  type: BillingScopeType | null | undefined,
): Promise<BillingScope> {
  if (type === "organization") {
    const activeOrgId = await getActiveOrganizationId(userId);
    if (!activeOrgId) {
      throw new BillingScopeError(
        "No active organization found. Please select one.",
        400,
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", activeOrgId)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      throw new BillingScopeError("Failed to verify organization role", 500);
    }

    const role = (membership as { role?: OrgRole } | null)?.role ?? null;
    if (!role || role === "member") {
      throw new BillingScopeError(
        "You don't have permission to manage billing for this organization.",
        403,
      );
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", activeOrgId)
      .maybeSingle();

    if (orgError) {
      throw new BillingScopeError("Failed to load organization", 500);
    }

    return {
      type: "organization",
      organizationId: activeOrgId,
      role,
      customerId:
        (org as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ??
        null,
      subscriptionId:
        (org as { stripe_subscription_id?: string | null } | null)
          ?.stripe_subscription_id ?? null,
    };
  }

  // personal
  const { data: userSettings, error: userSettingsError } = await supabase
    .from("user_settings")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (userSettingsError) {
    throw new BillingScopeError("Failed to load user billing settings", 500);
  }

  return {
    type: "personal",
    customerId: userSettings?.stripe_customer_id ?? null,
    subscriptionId: userSettings?.stripe_subscription_id ?? null,
  };
}


