"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Bell,
  Box,
  Check,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  Shield,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import {
  ApiError,
  apiRequest,
  formatStatus,
  money,
  type Role,
  type Shipment,
  type ShipmentStatus,
  type User,
} from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type DashboardStats = {
  users: number;
  shipments: number;
  delivered: number;
  pendingPayments: number;
  paidRevenue: number;
};
type AdminUser = User & { courierProfile?: { id: string; availability: string; vehicleType: string } | null };
type Notice = { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string };
type Hub = { id: string; name: string; code: string; city: string; address: string; zoneId?: string | null; isActive: boolean; zone?: { name: string } | null };
type Zone = { id: string; name: string };
type AuditEntry = { id: string; action: string; entityType: string; entityId: string; createdAt: string; user?: { name: string; email: string } | null };

const courierSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(8).max(20).optional().or(z.literal("")),
  vehicleType: z.enum(["BICYCLE", "BIKE", "VAN", "TRUCK"]),
});
const zoneFormSchema = z.object({ name: z.string().trim().min(2).max(100) });
const hubFormSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  city: z.string().trim().min(2),
  address: z.string().trim().min(5),
  zoneId: z.string().uuid(),
});
const pricingFormSchema = z.object({
  fromZoneId: z.string().uuid(),
  toZoneId: z.string().uuid(),
  baseFare: z.coerce.number().nonnegative(),
  perKgRate: z.coerce.number().nonnegative(),
});
const quoteFormSchema = z.object({
  fromHubId: z.string().uuid(),
  toHubId: z.string().uuid(),
  weightKg: z.coerce.number().positive(),
}).refine((values) => values.fromHubId !== values.toHubId, {
  path: ["toHubId"],
  message: "Choose a different destination hub.",
});
const profileFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.union([z.string().trim().min(8).max(20), z.literal("")]),
});

const customerItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shipments", label: "My shipments", icon: Package },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "My account", icon: Settings2 },
];
const courierItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shipments", label: "Assigned deliveries", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Courier profile", icon: Settings2 },
];
const adminItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "people", label: "People & couriers", icon: Users },
  { id: "operations", label: "Hubs & zones", icon: MapPin },
  { id: "pricing", label: "Pricing rules", icon: CircleDollarSign },
  { id: "audit", label: "Audit trail", icon: ClipboardList },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "My account", icon: Settings2 },
];

const statusTransitions: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ["PICKUP_SCHEDULED"],
  PICKUP_SCHEDULED: ["PICKED_UP"],
  PICKED_UP: ["AT_ORIGIN_HUB"],
  AT_ORIGIN_HUB: ["IN_TRANSIT"],
  IN_TRANSIT: ["AT_DESTINATION_HUB"],
  AT_DESTINATION_HUB: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["RETURNED"],
};
const titles: Record<string, string> = {
  overview: "A clear view of what’s moving.",
  shipments: "Every parcel, in one place.",
  people: "The people behind every delivery.",
  operations: "The network that gets it there.",
  pricing: "Straightforward, route-based pricing.",
  audit: "A record of what changed and when.",
  notifications: "Your latest updates.",
  account: "Your delivery profile.",
};

function Alert({ text, onClose }: { text: string; onClose: () => void }) {
  return <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#f0d2cb] bg-[#fff5f2] px-4 py-3 text-xs font-semibold leading-5 text-[#a5463b]"><span>{text}</span><button type="button" aria-label="Dismiss error" onClick={onClose}><X size={15} /></button></div>;
}

function SkeletonCards() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="rounded-2xl border border-[#e5ebe4] bg-white p-5"><div className="skeleton h-3 w-24 rounded" /><div className="skeleton mt-5 h-8 w-20 rounded" /><div className="skeleton mt-4 h-3 w-32 rounded" /></div>)}</div>;
}

function StatCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: typeof Package; tone: string }) {
  return <article className="rounded-2xl border border-[#e6ebe4] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_-28px_#294b35]"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[#7b887e]">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-.06em] text-[#22342a]">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span></div><p className="mt-3 text-[11px] text-[#8a968e]">{detail}</p></article>;
}

export function DashboardShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const cachedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const requestedTab = searchParams.get("tab") || "overview";
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await apiRequest<User>("/users/me")).data,
  });
  const user = profileQuery.data || cachedUser;
  useEffect(() => {
    if (profileQuery.data) setUser(profileQuery.data);
  }, [profileQuery.data, setUser]);
  useEffect(() => {
    if (profileQuery.error instanceof ApiError && profileQuery.error.status === 401) {
      router.replace("/login");
    }
  }, [profileQuery.isError, profileQuery.error, router]);
  useEffect(() => {
    const returnToLogin = () => router.replace("/login");
    window.addEventListener("parcelpilot:unauthorized", returnToLogin);
    return () => window.removeEventListener("parcelpilot:unauthorized", returnToLogin);
  }, [router]);

  const role: Role = user?.role || "CUSTOMER";
  const navItems = role === "ADMIN" ? adminItems : role === "COURIER" ? courierItems : customerItems;
  const tab = navItems.some((item) => item.id === requestedTab) ? requestedTab : "overview";
  const shipmentQuery = useQuery({
    queryKey: ["shipments", role, searchFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (searchFilter) params.set("search", searchFilter);
      if (statusFilter) params.set("status", statusFilter);
      return (await apiRequest<Shipment[]>(`/shipments?${params.toString()}`)).data;
    },
    enabled: Boolean(user),
  });
  const statsQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await apiRequest<DashboardStats>("/admin/dashboard")).data,
    enabled: role === "ADMIN",
  });
  const courierQuery = useQuery({
    queryKey: ["courier-list"],
    queryFn: async () => (await apiRequest<AdminUser[]>("/admin/users?role=COURIER&limit=100")).data,
    enabled: role === "ADMIN" && (tab === "shipments" || tab === "people"),
  });
  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: async () => (await apiRequest<AdminUser[]>("/admin/users?limit=100")).data,
    enabled: role === "ADMIN" && tab === "people",
  });
  const zonesQuery = useQuery({
    queryKey: ["zones"],
    queryFn: async () => (await apiRequest<Zone[]>("/operations/zones")).data,
    enabled: role === "ADMIN" && (tab === "pricing" || tab === "operations"),
  });
  const hubsQuery = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => (await apiRequest<Hub[]>("/operations/hubs")).data,
    enabled: role === "ADMIN" && (tab === "operations" || tab === "pricing"),
  });
  const auditQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await apiRequest<AuditEntry[]>("/admin/audit-logs?limit=50")).data,
    enabled: role === "ADMIN" && tab === "audit",
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await apiRequest<Notice[]>("/users/notifications")).data,
    enabled: Boolean(user) && tab === "notifications",
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["shipments"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["courier-list"] }),
      queryClient.invalidateQueries({ queryKey: ["people"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };
  const actionMutation = useMutation({
    mutationFn: ({ path, method, body }: { path: string; method: string; body?: unknown }) =>
      apiRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }),
    onSuccess: () => { setError(""); void invalidate(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "The action could not be completed."),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) =>
      apiRequest(`/shipments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => { setError(""); void invalidate(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Status could not be updated."),
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/shipments/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => { setError(""); void invalidate(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Shipment could not be cancelled."),
  });
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/auth/logout", { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => { setUser(null); queryClient.clear(); router.replace("/login"); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Sign out could not be completed."),
  });
  const availabilityMutation = useMutation({
    mutationFn: (availability: string) => apiRequest("/users/courier/availability", { method: "PATCH", body: JSON.stringify({ availability }) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Availability could not be changed."),
  });

  const shipments = shipmentQuery.data || [];
  const inProgress = shipments.filter((item) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(item.status));
  const delivered = shipments.filter((item) => item.status === "DELIVERED");
  const unreadCount = notificationsQuery.data?.filter((item) => !item.isRead).length || 0;
  const displayName = user?.name?.split(" ")[0] || "there";
  const heading = titles[tab] || titles.overview;

  const navTo = (id: string) => {
    setMobileNavOpen(false);
    router.push(id === "overview" ? "/dashboard" : `/dashboard?tab=${id}`);
  };
  const updateShipmentFilters = (filters: { search?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "shipments");
    if (filters.search !== undefined) {
      if (filters.search) params.set("search", filters.search);
      else params.delete("search");
    }
    if (filters.status !== undefined) {
      if (filters.status) params.set("status", filters.status);
      else params.delete("status");
    }
    router.replace(`/dashboard?${params.toString()}`);
  };
  const updateStatus = (shipment: Shipment, status: ShipmentStatus) => statusMutation.mutate({ id: shipment.id, status });

  async function handlePayment(shipmentId: string) {
    try {
      setError("");
      const response = await apiRequest<{ paymentId: string; paymentURL: string }>("/payments/initiate", {
        method: "POST",
        body: JSON.stringify({ shipmentId, provider: "BKASH" }),
      });
      window.location.assign(response.data.paymentURL);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The bKash checkout could not be started.");
    }
  }

  const headerAction = role === "CUSTOMER" ? (
    <Link href="/dashboard/shipments/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#176b4d] px-3.5 text-xs font-extrabold text-white transition hover:bg-[#10563d] sm:px-4"><Plus size={15} /> <span className="hidden sm:inline">New shipment</span><span className="sm:hidden">New</span></Link>
  ) : role === "COURIER" ? (
    <label className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe6de] bg-white px-3 text-[11px] font-extrabold text-[#526259]">
      <span className={`size-2 rounded-full ${user?.courierProfile?.availability === "AVAILABLE" ? "bg-[#54a776]" : user?.courierProfile?.availability === "BUSY" ? "bg-[#e2a24d]" : "bg-[#99a49c]"}`} />
      <span className="hidden sm:inline">Availability</span>
      <select aria-label="Courier availability" value={user?.courierProfile?.availability || "OFFLINE"} onChange={(event) => availabilityMutation.mutate(event.target.value)} className="max-w-[102px] cursor-pointer bg-transparent font-extrabold outline-none">
        <option value="AVAILABLE">Available</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option>
      </select>
    </label>
  ) : <span className="hidden rounded-lg border border-[#e2eae2] bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-[#6e8174] sm:inline-flex"><Shield size={13} className="mr-1.5" /> Admin desk</span>;

  const visibleShipments = useMemo(() => [...shipments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [shipments]);
  const activeQueryError =
    tab === "overview" && role === "ADMIN"
      ? statsQuery.error?.message
      : tab === "people"
        ? peopleQuery.error?.message
        : tab === "operations"
          ? zonesQuery.error?.message || hubsQuery.error?.message
          : tab === "pricing"
            ? zonesQuery.error?.message || hubsQuery.error?.message
            : tab === "audit"
              ? auditQuery.error?.message
              : tab === "notifications"
                ? notificationsQuery.error?.message
                : undefined;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[#e5ebe3] bg-[#f8f9f6]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} className="grid size-9 place-items-center rounded-xl border border-[#e1e8df] bg-white text-[#476052] lg:hidden">{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button>
            <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-.06em]"><span className="grid size-9 place-items-center rounded-xl bg-[#176b4d] text-white"><Box size={17} /></span><span>parcel<span className="text-[#176b4d]">pilot</span></span></Link>
            <span className="hidden h-6 w-px bg-[#dce4dc] sm:block" />
            <span className="hidden text-[10px] font-extrabold uppercase tracking-[.13em] text-[#829087] sm:block">{role.toLowerCase()} workspace</span>
          </div>
          <div className="flex items-center gap-2.5">
            {headerAction}
            <Tooltip content={unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "Notifications"}>
              <button type="button" onClick={() => navTo("notifications")} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative grid size-10 place-items-center rounded-xl border border-[#e1e8df] bg-white text-[#607267] transition hover:text-[#176b4d]"><Bell size={17} />{unreadCount > 0 ? <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-[#dd8262]" /> : null}</button>
            </Tooltip>
            <span className="hidden size-9 place-items-center rounded-full bg-[#dcebe0] text-xs font-extrabold text-[#2b6540] sm:grid">{user?.name?.slice(0, 1).toUpperCase() || "P"}</span>
            <button type="button" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} aria-label="Log out" className="grid size-10 place-items-center rounded-xl border border-[#e1e8df] bg-white text-[#6b7970] transition hover:border-[#e5c7c0] hover:text-[#a64e43] disabled:opacity-50"><LogOut size={17} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} fixed bottom-0 left-0 top-[68px] z-20 w-[260px] border-r border-[#e5ebe3] bg-[#f8f9f6] p-4 transition-transform lg:sticky lg:top-[68px] lg:block lg:h-[calc(100vh-68px)] lg:translate-x-0`}>
          <div className="px-3 py-4"><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#9aa69d]">WORKSPACE</p></div>
          <nav className="space-y-1" aria-label="Workspace navigation">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = tab === id || (id === "shipments" && pathname.startsWith("/dashboard/shipments"));
              return <button key={id} type="button" onClick={() => navTo(id)} aria-current={active ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${active ? "bg-[#e4f1e7] text-[#236646]" : "text-[#69786e] hover:bg-white hover:text-[#33473a]"}`}><Icon size={16} strokeWidth={active ? 2.4 : 1.9} />{label}{id === "notifications" && unreadCount ? <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-[#d5e9da] px-1.5 py-0.5 text-[9px] font-extrabold text-[#35744e]">{unreadCount}</span> : null}</button>;
            })}
          </nav>
          <div className="absolute inset-x-4 bottom-5 rounded-2xl border border-[#e3eae1] bg-white p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-[#f4eadb] text-[#946c38]"><MapPin size={17} /></span>
            <p className="mt-3 text-[11px] font-extrabold text-[#304239]">Parcel status, made clear.</p>
            <p className="mt-1 text-[10px] leading-4 text-[#89958d]">See the latest update on every shipment in your care.</p>
            {role === "CUSTOMER" ? <Link href="/track" className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#28734d]">Track a parcel <ArrowRight size={12} /></Link> : null}
          </div>
        </aside>
        {mobileNavOpen ? <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-10 bg-[#17251f]/20 lg:hidden" /> : null}

        <main className="min-w-0 flex-1 px-4 pb-12 pt-7 sm:px-7 sm:pt-9 lg:px-10 lg:pt-10">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#659073]">Good to see you, {displayName}</p><h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-.07em]">{heading}</h1><p className="mt-2 text-xs text-[#829087]">{role === "ADMIN" ? "Your logistics network, at a glance." : role === "COURIER" ? "Your route, your deliveries, your day." : "Your parcels and their progress, all together."}</p></div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link href="/track" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe6de] bg-white px-3.5 text-xs font-bold text-[#53655a] transition hover:border-[#b8d1be]"><Search size={15} /> Track parcel</Link>
            </div>
          </div>
          {error ? <Alert text={error} onClose={() => setError("")} /> : null}
          {activeQueryError ? <Alert text={activeQueryError} onClose={() => void queryClient.invalidateQueries({ queryKey: [tab === "overview" ? "admin-dashboard" : tab === "people" ? "people" : tab === "operations" || tab === "pricing" ? "hubs" : tab === "audit" ? "audit-logs" : "notifications"] })} /> : null}
          {profileQuery.isLoading && !user ? <SkeletonCards /> : profileQuery.isError && !user ? <div role="alert" className="rounded-2xl border border-[#efd5cf] bg-white p-6 text-sm text-[#a5463b]">Could not load your account. Please log in again or retry from the login screen.</div> : null}
          {user ? (
            <>
              {tab === "overview" && shipmentQuery.isError ? <Alert text={shipmentQuery.error.message} onClose={() => void shipmentQuery.refetch()} /> : null}
              {tab === "overview" ? (
                <Overview role={role} user={user} shipments={shipments} shipmentsLoading={shipmentQuery.isLoading} stats={statsQuery.data} statsLoading={statsQuery.isLoading} inProgress={inProgress.length} delivered={delivered.length} payment={handlePayment} />
              ) : tab === "shipments" ? (
                <ShipmentsPanel role={role} shipments={visibleShipments} loading={shipmentQuery.isLoading} couriers={courierQuery.data || []} updating={statusMutation.isPending || actionMutation.isPending || cancelMutation.isPending} search={searchFilter} status={statusFilter} onFilters={updateShipmentFilters} onStatus={updateStatus} onCancel={(shipmentId) => cancelMutation.mutate(shipmentId)} onAssign={(shipmentId, courierId) => actionMutation.mutate({ path: `/shipments/${shipmentId}/assign`, method: "POST", body: { courierId } })} onPayment={handlePayment} error={shipmentQuery.isError ? shipmentQuery.error.message : ""} />
              ) : tab === "people" && role === "ADMIN" ? (
                <PeoplePanel users={peopleQuery.data || []} loading={peopleQuery.isLoading} currentUserId={user.id} onCreated={() => { void queryClient.invalidateQueries({ queryKey: ["people"] }); }} />
              ) : tab === "operations" && role === "ADMIN" ? (
                <OperationsPanel zones={zonesQuery.data || []} hubs={hubsQuery.data || []} loading={hubsQuery.isLoading} onRefresh={() => void queryClient.invalidateQueries({ queryKey: ["hubs"] })} />
              ) : tab === "pricing" && role === "ADMIN" ? (
                <PricingPanel zones={zonesQuery.data || []} hubs={hubsQuery.data || []} loading={zonesQuery.isLoading || hubsQuery.isLoading} onSaved={() => setError("")} />
              ) : tab === "audit" && role === "ADMIN" ? (
                <AuditPanel entries={auditQuery.data || []} loading={auditQuery.isLoading} />
              ) : tab === "notifications" ? (
                <NotificationsPanel items={notificationsQuery.data || []} loading={notificationsQuery.isLoading} onRead={(id) => actionMutation.mutate({ path: `/users/notifications/${id}/read`, method: "PATCH" })} />
              ) : tab === "account" ? (
                <AccountPanel role={role} user={user} onSaved={() => void queryClient.invalidateQueries({ queryKey: ["profile"] })} onError={setError} />
              ) : (
                <Overview role={role} user={user} shipments={shipments} shipmentsLoading={shipmentQuery.isLoading} stats={statsQuery.data} statsLoading={statsQuery.isLoading} inProgress={inProgress.length} delivered={delivered.length} payment={handlePayment} />
              )}
            </>
          ) : null}
          <footer className="mt-10 flex flex-col gap-1 border-t border-[#e6ebe4] pt-5 text-[10px] text-[#99a49c] sm:flex-row sm:items-center sm:justify-between"><span>ParcelPilot Logistics · Delivery, without the detour.</span><span>Signed in as {user?.email || "—"}</span></footer>
        </main>
      </div>
    </div>
  );
}

function Overview({ role, user, shipments, shipmentsLoading, stats, statsLoading, inProgress, delivered, payment }: { role: Role; user: User; shipments: Shipment[]; shipmentsLoading: boolean; stats?: DashboardStats; statsLoading: boolean; inProgress: number; delivered: number; payment: (id: string) => void }) {
  const unpaid = shipments.filter((shipment) => !shipment.payments?.some((item) => item.status === "PAID"));
  return (
    <div className="space-y-6">
      {role === "ADMIN" ? (
        statsLoading ? <SkeletonCards /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total shipments" value={stats?.shipments ?? "—"} detail="Parcels handled by the network" icon={Package} tone="bg-[#e6f2e9] text-[#37764e]" />
          <StatCard label="Delivered" value={stats?.delivered ?? "—"} detail="Successfully completed" icon={Check} tone="bg-[#eef3e8] text-[#688444]" />
          <StatCard label="Awaiting payment" value={stats?.pendingPayments ?? "—"} detail="Pending payment sessions" icon={Clock3} tone="bg-[#fbf2e2] text-[#aa7b38]" />
          <StatCard label="Paid revenue" value={money(stats?.paidRevenue ?? 0)} detail="Confirmed payments" icon={CircleDollarSign} tone="bg-[#edf0f8] text-[#6473a0]" />
        </div>
      ) : role === "COURIER" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Assigned to you" value={shipmentsLoading ? "…" : shipments.length} detail="Shipments in your queue" icon={Truck} tone="bg-[#e6f2e9] text-[#37764e]" />
          <StatCard label="On the move" value={shipmentsLoading ? "…" : inProgress} detail="Not yet completed or cancelled" icon={Activity} tone="bg-[#fbf2e2] text-[#aa7b38]" />
          <StatCard label="Completed deliveries" value={user.courierProfile?.totalDeliveries ?? 0} detail="All-time delivery count" icon={Check} tone="bg-[#eef3e8] text-[#688444]" />
          <StatCard label="Earnings balance" value={money(user.courierProfile?.earningsBalance ?? 0)} detail="Earn 70% of delivery charge" icon={Wallet} tone="bg-[#edf0f8] text-[#6473a0]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="My shipments" value={shipmentsLoading ? "…" : shipments.length} detail="Every parcel you have booked" icon={Package} tone="bg-[#e6f2e9] text-[#37764e]" />
          <StatCard label="On the move" value={shipmentsLoading ? "…" : inProgress} detail="Currently in the delivery network" icon={Truck} tone="bg-[#fbf2e2] text-[#aa7b38]" />
          <StatCard label="Delivered" value={shipmentsLoading ? "…" : delivered} detail="Arrived at their destination" icon={Check} tone="bg-[#eef3e8] text-[#688444]" />
          <StatCard label="Ready for payment" value={shipmentsLoading ? "…" : unpaid.filter((item) => !["CANCELLED", "DELIVERED"].includes(item.status)).length} detail="bKash checkout available" icon={CircleDollarSign} tone="bg-[#edf0f8] text-[#6473a0]" />
        </div>
      )}
      {role === "CUSTOMER" && unpaid.some((item) => !["CANCELLED", "DELIVERED"].includes(item.status)) ? <section className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e8dfcb] bg-[#fffaf0] p-4 sm:flex-row sm:items-center sm:px-5"><div><p className="text-xs font-extrabold text-[#735c34]">A quick heads-up</p><p className="mt-1 text-[11px] leading-5 text-[#8d7957]">You have shipments ready for payment. Complete checkout securely with bKash.</p></div><Link href="/dashboard?tab=shipments" className="inline-flex h-9 items-center gap-2 self-start rounded-lg bg-white px-3 text-[11px] font-extrabold text-[#785e31] shadow-sm">Review shipments <ArrowRight size={13} /></Link></section> : null}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0eb] px-5 py-4"><div><h2 className="text-sm font-extrabold">Recent shipments</h2><p className="mt-1 text-[10px] text-[#8c9890]">{role === "COURIER" ? "Your latest assigned deliveries" : "Latest parcel activity"}</p></div><Link href="/dashboard?tab=shipments" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#28734d]">View all <ArrowRight size={12} /></Link></div>
          <ShipmentsList shipments={shipments.slice(0, 5)} loading={shipmentsLoading} role={role} compact onPayment={payment} />
        </section>
        <section className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#87948b]">{role === "ADMIN" ? "Network snapshot" : role === "COURIER" ? "Today’s focus" : "Quick actions"}</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-.04em]">{role === "ADMIN" ? "Keep the network in step." : role === "COURIER" ? "Every handoff matters." : "What would you like to do?"}</h2>
          <p className="mt-2 text-xs leading-5 text-[#809087]">{role === "ADMIN" ? "Assign available couriers, review the hub network, or check recent activity." : role === "COURIER" ? "Update each shipment as it moves, so customers know what comes next." : "Book a new pickup or check in on a parcel already on its way."}</p>
          <div className="mt-5 space-y-2">
            {role === "CUSTOMER" ? <Link href="/dashboard/shipments/new" className="flex items-center justify-between rounded-xl bg-[#edf5ee] px-3.5 py-3 text-xs font-extrabold text-[#33704b]"><span className="flex items-center gap-2"><Plus size={15} /> Create shipment</span><ArrowRight size={14} /></Link> : null}
            {role === "CUSTOMER" ? <Link href="/track" className="flex items-center justify-between rounded-xl bg-[#f7f3eb] px-3.5 py-3 text-xs font-extrabold text-[#85683d]"><span className="flex items-center gap-2"><MapPin size={15} /> Public tracking</span><ArrowRight size={14} /></Link> : null}
            {role === "COURIER" ? <Link href="/dashboard?tab=shipments" className="flex items-center justify-between rounded-xl bg-[#edf5ee] px-3.5 py-3 text-xs font-extrabold text-[#33704b]"><span className="flex items-center gap-2"><Truck size={15} /> Open delivery queue</span><ArrowRight size={14} /></Link> : null}
            {role === "ADMIN" ? <Link href="/dashboard?tab=shipments" className="flex items-center justify-between rounded-xl bg-[#edf5ee] px-3.5 py-3 text-xs font-extrabold text-[#33704b]"><span className="flex items-center gap-2"><Truck size={15} /> Assign a courier</span><ArrowRight size={14} /></Link> : null}
            {role === "ADMIN" ? <Link href="/dashboard?tab=operations" className="flex items-center justify-between rounded-xl bg-[#f7f3eb] px-3.5 py-3 text-xs font-extrabold text-[#85683d]"><span className="flex items-center gap-2"><MapPin size={15} /> Manage hubs & zones</span><ArrowRight size={14} /></Link> : null}
          </div>
          {role === "COURIER" ? <div className="mt-5 flex items-center gap-2 border-t border-[#edf0eb] pt-4 text-[10px] text-[#839087]"><Activity size={14} className="text-[#54876a]" /> Your availability is <strong className="text-[#476352]">{user.courierProfile?.availability?.toLowerCase() || "offline"}</strong></div> : null}
        </section>
      </div>
    </div>
  );
}

function ShipmentsPanel({ role, shipments, loading, couriers, updating, search, status, onFilters, onStatus, onCancel, onAssign, onPayment, error }: { role: Role; shipments: Shipment[]; loading: boolean; couriers: AdminUser[]; updating: boolean; search: string; status: string; onFilters: (filters: { search?: string; status?: string }) => void; onStatus: (shipment: Shipment, status: ShipmentStatus) => void; onCancel: (shipmentId: string) => void; onAssign: (shipmentId: string, courierId: string) => void; onPayment: (shipmentId: string) => void; error: string }) {
  const [searchTerm, setSearchTerm] = useState(search);
  useEffect(() => setSearchTerm(search), [search]);
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-[#edf0eb] px-5 py-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-extrabold">{role === "COURIER" ? "Your delivery queue" : role === "CUSTOMER" ? "Your shipments" : "Network shipment board"}</h2><p className="mt-1 text-[10px] text-[#8c9890]">{role === "ADMIN" ? "Assign eligible parcels to an available courier." : "Select a tracking code to see the full parcel journey."}</p></div>{role === "CUSTOMER" ? <Link href="/dashboard/shipments/new" className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[#176b4d] px-3 text-[10px] font-extrabold text-white"><Plus size={13} /> New shipment</Link> : null}</div>
      <form onSubmit={(event) => { event.preventDefault(); onFilters({ search: searchTerm.trim() }); }} className="flex flex-col gap-2 border-b border-[#edf0eb] bg-[#fbfcfa] p-4 sm:flex-row">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#e3e9e1] bg-white px-3 text-[#87938b]"><Search size={14} /><span className="sr-only">Search by tracking code or sender/recipient</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tracking code or name" className="min-w-0 flex-1 text-xs font-medium text-[#35463b] outline-none placeholder:text-[#a3ada5]" /></label>
        <label className="sr-only" htmlFor="shipment-status-filter">Filter by status</label><select id="shipment-status-filter" value={status} onChange={(event) => onFilters({ status: event.target.value })} className="h-10 rounded-lg border border-[#e3e9e1] bg-white px-3 text-xs font-bold text-[#607066] outline-none"><option value="">All statuses</option>{["PENDING", "PICKUP_SCHEDULED", "PICKED_UP", "AT_ORIGIN_HUB", "IN_TRANSIT", "AT_DESTINATION_HUB", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY", "RETURNED", "CANCELLED"].map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</select>
        <button type="submit" className="h-10 rounded-lg border border-[#dfe6de] bg-white px-4 text-[10px] font-extrabold text-[#52645a] transition hover:bg-[#f3f7f2]">Search</button>
        {search || status ? <button type="button" onClick={() => { setSearchTerm(""); onFilters({ search: "", status: "" }); }} className="inline-flex h-10 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-bold text-[#829087]"><X size={13} /> Clear</button> : null}
      </form>
      {error ? <p role="alert" className="border-b border-[#f0d2cb] bg-[#fff5f2] px-5 py-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}
      <ShipmentsList shipments={shipments} loading={loading} role={role} onStatus={onStatus} onCancel={onCancel} couriers={couriers} onAssign={onAssign} onPayment={onPayment} updating={updating} />
    </section>
  );
}

function ShipmentsList({ shipments, loading, role, compact = false, onStatus, onCancel, couriers = [], onAssign, onPayment, updating = false }: { shipments: Shipment[]; loading: boolean; role: Role; compact?: boolean; onStatus?: (shipment: Shipment, status: ShipmentStatus) => void; onCancel?: (shipmentId: string) => void; couriers?: AdminUser[]; onAssign?: (shipmentId: string, courierId: string) => void; onPayment?: (shipmentId: string) => void; updating?: boolean }) {
  if (loading) return <div className="space-y-3 p-5">{[0, 1, 2, 3].slice(0, compact ? 3 : 4).map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>;
  if (!shipments.length) return <div className="grid min-h-52 place-items-center px-5 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#edf4ed] text-[#588368]"><Package size={20} /></span><p className="mt-3 text-sm font-bold">Nothing in motion just yet.</p><p className="mt-1 text-xs text-[#839087]">{role === "CUSTOMER" ? "Your shipment list will fill in after your first booking." : role === "COURIER" ? "New assignments will show up here." : "Shipments will appear here when a customer books one."}</p>{role === "CUSTOMER" ? <Link href="/dashboard/shipments/new" className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#27714a]">Create a shipment <ArrowRight size={13} /></Link> : null}</div></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[710px] border-collapse text-left">
        <thead><tr className="border-b border-[#f0f2ee] text-[9px] font-extrabold uppercase tracking-[.12em] text-[#9aa59d]"><th className="px-5 py-3">Shipment</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">Status</th>{role === "ADMIN" ? <th className="px-5 py-3">Courier</th> : null}<th className="px-5 py-3">Charge</th>{!compact ? <th className="px-5 py-3">Action</th> : null}</tr></thead>
        <tbody>
          {shipments.map((shipment) => {
            const next = statusTransitions[shipment.status] || [];
            const isPaid = shipment.payments?.some((payment) => payment.status === "PAID");
            const assignable = role === "ADMIN" && !shipment.courier && ["PENDING", "PICKUP_SCHEDULED"].includes(shipment.status);
            const availableCouriers = couriers.filter((person) => person.courierProfile?.availability === "AVAILABLE" && person.courierProfile.id);
            return <tr key={shipment.id} className="border-b border-[#f1f3ef] last:border-0 hover:bg-[#fbfcfa]">
              <td className="px-5 py-3.5"><Link href={`/dashboard/shipments/${shipment.id}`} className="font-mono text-[11px] font-extrabold tracking-wide text-[#316f4c] hover:underline">{shipment.trackingCode}</Link><p className="mt-1 text-[10px] text-[#929d95]">{new Date(shipment.createdAt).toLocaleDateString()}</p></td>
              <td className="px-5 py-3.5"><p className="max-w-52 truncate text-[11px] font-bold text-[#46564c]">{shipment.pickupHub?.name || shipment.pickupAddress}</p><p className="mt-1 max-w-52 truncate text-[10px] text-[#8d9990]">to {shipment.deliveryHub?.name || shipment.deliveryAddress}</p></td>
              <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold ${shipment.status === "DELIVERED" ? "bg-[#eaf5ec] text-[#3c8154]" : ["CANCELLED", "RETURNED", "FAILED_DELIVERY"].includes(shipment.status) ? "bg-[#fff0ed] text-[#ac5447]" : "bg-[#f3f2e8] text-[#907a3a]"}`}><span className="size-1.5 rounded-full bg-current" />{formatStatus(shipment.status)}</span></td>
              {role === "ADMIN" ? <td className="px-5 py-3.5">{assignable ? availableCouriers.length ? <select aria-label={`Assign courier to ${shipment.trackingCode}`} disabled={updating} defaultValue="" onChange={(event) => { if (event.target.value) onAssign?.(shipment.id, event.target.value); }} className="max-w-36 rounded-lg border border-[#e3e9e1] bg-white px-2 py-1.5 text-[10px] font-bold text-[#496052] outline-none"><option value="" disabled>Assign courier…</option>{availableCouriers.map((courier) => <option key={courier.courierProfile?.id} value={courier.courierProfile?.id}>{courier.name} · {courier.courierProfile?.vehicleType}</option>)}</select> : <span className="text-[10px] text-[#9aa49c]">No courier free</span> : <span className="text-[10px] font-semibold text-[#58685e]">{shipment.courier?.user?.name || "Assigned"}</span>}</td> : null}
              <td className="px-5 py-3.5"><span className="text-[11px] font-extrabold text-[#394a3f]">{money(shipment.deliveryCharge)}</span><p className="mt-1 text-[9px] text-[#8d9990]">{isPaid ? "Paid" : "Payment pending"}</p></td>
              {!compact ? <td className="px-5 py-3.5"><div className="flex items-center gap-2">
                <Link href={`/dashboard/shipments/${shipment.id}`} className="text-[10px] font-extrabold text-[#35734d] hover:underline">Details</Link>
                {role === "CUSTOMER" && !isPaid && !["CANCELLED", "DELIVERED"].includes(shipment.status) ? <button type="button" disabled={updating} onClick={() => onPayment?.(shipment.id)} className="rounded-lg bg-[#176b4d] px-2.5 py-1.5 text-[9px] font-extrabold text-white disabled:opacity-50">Pay bKash</button> : null}
                {role === "CUSTOMER" && ["PENDING", "PICKUP_SCHEDULED"].includes(shipment.status) ? <ConfirmationDialog trigger={<button type="button" disabled={updating} className="rounded-lg border border-[#edd9d5] px-2.5 py-1.5 text-[9px] font-bold text-[#a34f45] disabled:opacity-50">Cancel</button>} title="Cancel this shipment?" description="This booking can only be cancelled before pickup. This action changes the shipment status and cannot be undone." confirmLabel="Cancel shipment" destructive onConfirm={() => onCancel?.(shipment.id)} /> : null}
                {(role === "ADMIN" || role === "COURIER") && next.length ? <select aria-label={`Update status for ${shipment.trackingCode}`} disabled={updating} defaultValue="" onChange={(event) => { if (event.target.value) onStatus?.(shipment, event.target.value as ShipmentStatus); }} className="max-w-36 rounded-lg border border-[#e3e9e1] bg-white px-2 py-1.5 text-[9px] font-bold text-[#496052] outline-none"><option value="" disabled>Update status…</option>{next.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select> : null}
              </div></td> : null}
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function PeoplePanel({ users, loading, currentUserId, onCreated }: { users: AdminUser[]; loading: boolean; currentUserId: string; onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const courierForm = useForm<z.input<typeof courierSchema>, unknown, z.output<typeof courierSchema>>({
    resolver: zodResolver(courierSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", vehicleType: "BIKE" },
  });
  const mutation = useMutation({
    mutationFn: (values: z.output<typeof courierSchema>) => apiRequest("/admin/couriers", { method: "POST", body: JSON.stringify({ ...values, phone: values.phone || undefined }) }),
    onSuccess: () => { setMessage("Courier account created and verified."); setError(""); courierForm.reset(); onCreated(); void queryClient.invalidateQueries({ queryKey: ["courier-list"] }); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not create courier."),
  });
  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["people"] }); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Role update failed."),
  });
  const deleteUser = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["people"] }),
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Account deletion failed."),
  });
  return <div className="space-y-5">
    <section className="rounded-2xl border border-[#e5ebe4] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf0eb] px-5 py-4"><div><h2 className="text-sm font-extrabold">Courier accounts</h2><p className="mt-1 text-[10px] text-[#8c9890]">Couriers are created by an admin and verified immediately.</p></div><button type="button" onClick={() => setShowCreate((show) => !show)} className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#176b4d] px-3 text-[10px] font-extrabold text-white"><Plus size={13} /> Create courier</button></div>
      {showCreate ? <form onSubmit={courierForm.handleSubmit((values) => { setError(""); setMessage(""); mutation.mutate(values); })} noValidate className="grid gap-3 border-b border-[#edf0eb] bg-[#fbfcfa] p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-[10px] font-bold text-[#56665c]">Name<input {...courierForm.register("name")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none focus:border-[#70a888]" />{courierForm.formState.errors.name?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{courierForm.formState.errors.name.message}</span> : null}</label>
        <label className="text-[10px] font-bold text-[#56665c]">Email<input {...courierForm.register("email")} type="email" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none focus:border-[#70a888]" />{courierForm.formState.errors.email?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{courierForm.formState.errors.email.message}</span> : null}</label>
        <label className="text-[10px] font-bold text-[#56665c]">Temporary password<input {...courierForm.register("password")} type="password" autoComplete="new-password" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none focus:border-[#70a888]" />{courierForm.formState.errors.password?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{courierForm.formState.errors.password.message}</span> : null}</label>
        <label className="text-[10px] font-bold text-[#56665c]">Phone<input {...courierForm.register("phone")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none focus:border-[#70a888]" />{courierForm.formState.errors.phone?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{courierForm.formState.errors.phone.message}</span> : null}</label>
        <label className="text-[10px] font-bold text-[#56665c]">Vehicle<select {...courierForm.register("vehicleType")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="BICYCLE">Bicycle</option><option value="BIKE">Bike</option><option value="VAN">Van</option><option value="TRUCK">Truck</option></select></label>
        <div className="flex items-end"><button disabled={mutation.isPending} className="h-10 w-full rounded-lg bg-[#176b4d] text-xs font-extrabold text-white disabled:opacity-50">{mutation.isPending ? "Creating…" : "Create verified courier"}</button></div>
      </form> : null}
      {error ? <p role="alert" className="px-5 pt-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}{message ? <p role="status" className="px-5 pt-3 text-xs font-semibold text-[#36724d]">{message}</p> : null}
    </section>
    <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white">
      <div className="border-b border-[#edf0eb] px-5 py-4"><h2 className="text-sm font-extrabold">User directory</h2><p className="mt-1 text-[10px] text-[#8c9890]">Change roles or soft-delete an account. Your own account cannot be changed here.</p></div>
      {loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="text-[9px] font-extrabold uppercase tracking-wider text-[#9aa59d]"><th className="px-5 py-3">Person</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Courier status</th><th className="px-5 py-3">Manage role</th><th className="px-5 py-3">Account</th></tr></thead><tbody>{users.map((person) => <tr key={person.id} className="border-t border-[#f0f2ee]"><td className="px-5 py-3"><p className="text-xs font-bold">{person.name}</p><p className="mt-1 text-[10px] text-[#89958d]">{person.email}</p></td><td className="px-5 py-3"><span className="rounded-full bg-[#eff3ed] px-2.5 py-1 text-[9px] font-extrabold text-[#53665a]">{person.role}</span></td><td className="px-5 py-3 text-[10px] text-[#77847a]">{person.courierProfile?.availability || "—"}</td><td className="px-5 py-3"><select aria-label={`Change role for ${person.name}`} value={person.role} disabled={person.id === currentUserId} onChange={(event) => updateRole.mutate({ id: person.id, role: event.target.value as Role })} className="rounded-lg border border-[#e2e8e1] bg-white px-2 py-1.5 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-50"><option value="CUSTOMER">Customer</option><option value="COURIER">Courier</option><option value="ADMIN">Admin</option></select></td><td className="px-5 py-3">{person.id === currentUserId ? <span className="text-[9px] text-[#9aa49c]">Current account</span> : <ConfirmationDialog trigger={<button type="button" className="text-[10px] font-bold text-[#a64e43] hover:underline">Delete</button>} title={`Delete ${person.name}?`} description="This account will be soft-deleted and will no longer be able to sign in." confirmLabel="Delete account" destructive onConfirm={() => deleteUser.mutate(person.id)} />}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

function OperationsPanel({ zones, hubs, loading, onRefresh }: { zones: Zone[]; hubs: Hub[]; loading: boolean; onRefresh: () => void }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const zoneForm = useForm<z.input<typeof zoneFormSchema>, unknown, z.output<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: { name: "" },
  });
  const hubForm = useForm<z.input<typeof hubFormSchema>, unknown, z.output<typeof hubFormSchema>>({
    resolver: zodResolver(hubFormSchema),
    defaultValues: { name: "", code: "", city: "", address: "", zoneId: "" },
  });
  const createZone = useMutation({
    mutationFn: (values: z.output<typeof zoneFormSchema>) => apiRequest("/operations/zones", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => { zoneForm.reset(); setMessage("Zone created."); setError(""); void queryClient.invalidateQueries({ queryKey: ["zones"] }); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not create zone."),
  });
  const createHub = useMutation({
    mutationFn: (values: z.output<typeof hubFormSchema>) => apiRequest("/operations/hubs", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => { hubForm.reset(); setMessage("Hub created."); setError(""); onRefresh(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not create hub."),
  });
  const toggleHub = useMutation({
    mutationFn: (hub: Hub) => apiRequest(`/operations/hubs/${hub.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !hub.isActive }) }),
    onSuccess: onRefresh,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Hub update failed."),
  });
  const deleteHub = useMutation({
    mutationFn: (id: string) => apiRequest(`/operations/hubs/${id}`, { method: "DELETE" }),
    onSuccess: onRefresh,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Hub removal failed."),
  });
  return <div className="space-y-5">
    {error ? <p role="alert" className="rounded-xl border border-[#f0d2cb] bg-[#fff5f2] p-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}{message ? <p role="status" className="rounded-xl border border-[#cae6d3] bg-[#eff9f1] p-3 text-xs font-semibold text-[#36724d]">{message}</p> : null}
    <div className="grid gap-5 xl:grid-cols-2">
      <form onSubmit={zoneForm.handleSubmit((values) => { setError(""); setMessage(""); createZone.mutate(values); })} noValidate className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><MapPin size={17} /></span><div><h2 className="text-sm font-extrabold">Delivery zones</h2><p className="mt-1 text-[10px] text-[#88948c]">Pricing is calculated between zones.</p></div></div>
        <div className="mt-5 flex gap-2"><label className="sr-only" htmlFor="new-zone">New zone name</label><input id="new-zone" {...zoneForm.register("name")} placeholder="e.g. Rajshahi" className="h-10 min-w-0 flex-1 rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /><button disabled={createZone.isPending} className="rounded-lg bg-[#176b4d] px-3 text-[10px] font-extrabold text-white disabled:opacity-50">Add zone</button></div>
        {zoneForm.formState.errors.name?.message ? <p role="alert" className="mt-1 text-[9px] text-[#b4473f]">{zoneForm.formState.errors.name.message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">{zones.map((zone) => <span key={zone.id} className="rounded-full bg-[#f0f4ee] px-3 py-1.5 text-[10px] font-bold text-[#65766a]">{zone.name}</span>)}{!zones.length ? <p className="text-[10px] text-[#99a49c]">No zones available yet.</p> : null}</div>
      </form>
      <form onSubmit={hubForm.handleSubmit((values) => { setError(""); setMessage(""); createHub.mutate(values); })} noValidate className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#f7f1e6] text-[#99753f]"><Truck size={17} /></span><div><h2 className="text-sm font-extrabold">Add a hub</h2><p className="mt-1 text-[10px] text-[#88948c]">Only active hubs can be used on new bookings.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-[10px] font-bold text-[#65746a]">Hub name<input {...hubForm.register("name")} className="mt-1.5 h-9 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
          <label className="text-[10px] font-bold text-[#65746a]">Code<input {...hubForm.register("code")} className="mt-1.5 h-9 w-full rounded-lg border border-[#dfe6de] px-3 text-xs uppercase outline-none focus:border-[#70a888]" /></label>
          <label className="text-[10px] font-bold text-[#65746a]">City<input {...hubForm.register("city")} className="mt-1.5 h-9 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
          <label className="text-[10px] font-bold text-[#65746a]">Zone<select {...hubForm.register("zoneId")} className="mt-1.5 h-9 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="">Choose a zone</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#65746a] sm:col-span-2">Address<input {...hubForm.register("address")} className="mt-1.5 h-9 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
        </div>
        {Object.entries(hubForm.formState.errors).map(([field, issue]) => <p key={field} role="alert" className="mt-1 text-[9px] text-[#b4473f]">{issue?.message}</p>)}
        <button disabled={createHub.isPending} className="mt-4 h-9 rounded-lg bg-[#176b4d] px-4 text-[10px] font-extrabold text-white disabled:opacity-50">Create hub</button>
      </form>
    </div>
    <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white">
      <div className="border-b border-[#edf0eb] px-5 py-4"><h2 className="text-sm font-extrabold">Hub directory</h2><p className="mt-1 text-[10px] text-[#8c9890]">Disable or soft-delete a hub that is no longer operating.</p></div>
      {loading ? <div className="skeleton m-5 h-36 rounded-xl" /> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="text-[9px] font-extrabold uppercase tracking-wider text-[#9aa59d]"><th className="px-5 py-3">Hub</th><th className="px-5 py-3">Zone</th><th className="px-5 py-3">Address</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{hubs.map((hub) => <tr key={hub.id} className="border-t border-[#f0f2ee]"><td className="px-5 py-3"><p className="text-xs font-bold">{hub.name}</p><p className="mt-1 font-mono text-[9px] text-[#8b978f]">{hub.code} · {hub.city}</p></td><td className="px-5 py-3 text-[10px] text-[#758278]">{hub.zone?.name || "Not assigned"}</td><td className="max-w-48 truncate px-5 py-3 text-[10px] text-[#758278]">{hub.address}</td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${hub.isActive ? "bg-[#eaf5ec] text-[#3c8154]" : "bg-[#f2f2ef] text-[#8b948d]"}`}>{hub.isActive ? "Active" : "Inactive"}</span></td><td className="px-5 py-3"><button type="button" onClick={() => toggleHub.mutate(hub)} className="mr-3 text-[10px] font-bold text-[#35734d] hover:underline">{hub.isActive ? "Disable" : "Enable"}</button><ConfirmationDialog trigger={<button type="button" className="text-[10px] font-bold text-[#a64e43] hover:underline">Delete</button>} title={`Delete ${hub.name}?`} description="This hub will be archived and deactivated. It will no longer be available for new bookings." confirmLabel="Delete hub" destructive onConfirm={() => deleteHub.mutate(hub.id)} /></td></tr>)}</tbody></table>{hubs.length === 0 ? <p className="p-5 text-xs text-[#829087]">No hubs set up yet.</p> : null}</div>}
    </section>
  </div>;
}

function PricingPanel({ zones, hubs, loading, onSaved }: { zones: Zone[]; hubs: Hub[]; loading: boolean; onSaved: () => void }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState<number | null>(null);
  const pricingForm = useForm<z.input<typeof pricingFormSchema>, unknown, z.output<typeof pricingFormSchema>>({
    resolver: zodResolver(pricingFormSchema),
  });
  const quoteForm = useForm<z.input<typeof quoteFormSchema>, unknown, z.output<typeof quoteFormSchema>>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: { weightKg: 1 },
  });
  const save = useMutation({
    mutationFn: (values: z.output<typeof pricingFormSchema>) => apiRequest("/operations/pricing", { method: "PUT", body: JSON.stringify(values) }),
    onSuccess: () => { setMessage("Pricing rule saved."); setError(""); onSaved(); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not save pricing."),
  });
  const calculate = useMutation({
    mutationFn: async (values: z.output<typeof quoteFormSchema>) => (await apiRequest<{ deliveryCharge: number }>("/operations/pricing/calculate", { method: "POST", body: JSON.stringify(values) })).data,
    onSuccess: (data) => { setQuote(data.deliveryCharge); setError(""); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Could not calculate route price."),
  });
  return <div className="grid gap-5 xl:grid-cols-2">
    <form onSubmit={pricingForm.handleSubmit((values) => { setMessage(""); setError(""); save.mutate(values); })} noValidate className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
      <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf0f8] text-[#6879a1]"><CircleDollarSign size={17} /></span><div><h2 className="text-sm font-extrabold">Zone pricing rule</h2><p className="mt-1 text-[10px] text-[#88948c]">Charge = base fare + per-kg rate × parcel weight.</p></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-[10px] font-bold text-[#65746a]">From zone<select {...pricingForm.register("fromZoneId")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="">Choose a zone</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
        <label className="text-[10px] font-bold text-[#65746a]">To zone<select {...pricingForm.register("toZoneId")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="">Choose a zone</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></label>
        <label className="text-[10px] font-bold text-[#65746a]">Base fare (BDT)<input {...pricingForm.register("baseFare")} type="number" step="0.01" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
        <label className="text-[10px] font-bold text-[#65746a]">Per kg (BDT)<input {...pricingForm.register("perKgRate")} type="number" step="0.01" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
      </div>
      {Object.entries(pricingForm.formState.errors).map(([field, issue]) => <p key={field} role="alert" className="mt-1 text-[9px] text-[#b4473f]">{issue?.message}</p>)}
      <button disabled={loading || save.isPending || !zones.length} className="mt-4 h-10 rounded-lg bg-[#176b4d] px-4 text-[10px] font-extrabold text-white disabled:opacity-50">{save.isPending ? "Saving…" : "Save or update rule"}</button>
      {error ? <p role="alert" className="mt-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}{message ? <p role="status" className="mt-3 text-xs font-semibold text-[#36724d]">{message}</p> : null}
    </form>
    <section className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
      <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><Search size={17} /></span><div><h2 className="text-sm font-extrabold">Try a delivery quote</h2><p className="mt-1 text-[10px] text-[#88948c]">Check the current rule using actual hub IDs.</p></div></div>
      <form onSubmit={quoteForm.handleSubmit((values) => calculate.mutate(values))} noValidate className="mt-5 space-y-3">
        <label className="block text-[10px] font-bold text-[#65746a]">Pickup hub<select {...quoteForm.register("fromHubId")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="">Choose a pickup hub</option>{hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.city}</option>)}</select></label>
        <label className="block text-[10px] font-bold text-[#65746a]">Delivery hub<select {...quoteForm.register("toHubId")} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] bg-white px-3 text-xs outline-none"><option value="">Choose a delivery hub</option>{hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.city}</option>)}</select></label>
        <label className="block text-[10px] font-bold text-[#65746a]">Weight (kg)<input {...quoteForm.register("weightKg")} min="0.01" step="0.01" type="number" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe6de] px-3 text-xs outline-none focus:border-[#70a888]" /></label>
        {Object.entries(quoteForm.formState.errors).map(([field, issue]) => <p key={field} role="alert" className="text-[9px] text-[#b4473f]">{issue?.message}</p>)}
        <button disabled={calculate.isPending} className="h-10 rounded-lg border border-[#dfe6de] px-4 text-[10px] font-extrabold text-[#52645a] disabled:opacity-50">{calculate.isPending ? "Calculating…" : "Calculate route"}</button>
      </form>
      {quote !== null ? <p className="mt-4 rounded-xl bg-[#eef6ef] p-3 text-sm font-extrabold text-[#2f7149]">Estimated delivery charge: {money(quote)}</p> : null}
    </section>
  </div>;
}

function AuditPanel({ entries, loading }: { entries: AuditEntry[]; loading: boolean }) {
  return <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white"><div className="border-b border-[#edf0eb] px-5 py-4"><h2 className="text-sm font-extrabold">Recent audit events</h2><p className="mt-1 text-[10px] text-[#8c9890]">Administrative changes and shipment workflow events.</p></div>{loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div> : <div className="divide-y divide-[#f0f2ee]">{entries.map((entry) => <article key={entry.id} className="flex flex-col justify-between gap-2 px-5 py-3.5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><Activity size={15} /></span><div><p className="text-xs font-extrabold">{formatStatus(entry.action)}</p><p className="mt-1 text-[10px] text-[#89958d]">{entry.user?.name || "System"} · {entry.entityType} · {entry.entityId.slice(0, 12)}</p></div></div><time className="pl-11 text-[10px] text-[#929d95] sm:pl-0">{new Date(entry.createdAt).toLocaleString()}</time></article>)}{!entries.length ? <p className="p-6 text-xs text-[#829087]">No audit entries yet.</p> : null}</div>}</section>;
}

function NotificationsPanel({ items, loading, onRead }: { items: Notice[]; loading: boolean; onRead: (id: string) => void }) {
  return <section className="overflow-hidden rounded-2xl border border-[#e5ebe4] bg-white"><div className="border-b border-[#edf0eb] px-5 py-4"><h2 className="text-sm font-extrabold">All notifications</h2><p className="mt-1 text-[10px] text-[#8c9890]">Shipment assignments, status changes, and payment confirmations.</p></div>{loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div> : <div className="divide-y divide-[#f0f2ee]">{items.map((item) => <article key={item.id} className={`flex items-start gap-3 px-5 py-4 ${item.isRead ? "" : "bg-[#fbfdf9]"}`}><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${item.isRead ? "bg-[#f1f3ef] text-[#89958d]" : "bg-[#e4f1e7] text-[#39784f]"}`}><Bell size={15} /></span><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-xs font-extrabold">{item.title}</p><time className="text-[10px] text-[#929d95]">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-1 text-xs leading-5 text-[#738177]">{item.message}</p></div>{!item.isRead ? <button type="button" onClick={() => onRead(item.id)} className="shrink-0 rounded-lg border border-[#dfe8df] px-2.5 py-1.5 text-[9px] font-bold text-[#4c7057] hover:bg-[#f4f8f3]">Mark read</button> : null}</article>)}{!items.length ? <p className="p-6 text-xs text-[#829087]">You’re all caught up. New activity will show here.</p> : null}</div>}</section>;
}

function AccountPanel({ role, user, onSaved, onError }: { role: Role; user: User; onSaved: () => void; onError: (message: string) => void }) {
  const form = useForm<z.input<typeof profileFormSchema>, unknown, z.output<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name, phone: user.phone || "" },
  });
  const { reset } = form;
  useEffect(() => {
    reset({ name: user.name, phone: user.phone || "" });
  }, [reset, user.name, user.phone]);
  const mutation = useMutation({
    mutationFn: (values: z.output<typeof profileFormSchema>) => apiRequest<User>("/users/me", { method: "PATCH", body: JSON.stringify({ ...values, phone: values.phone || null }) }),
    onSuccess: onSaved,
    onError: (cause) => onError(cause instanceof Error ? cause.message : "Profile update failed."),
  });
  return <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="rounded-2xl border border-[#e5ebe4] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e7f2e9] text-[#4e8060]"><Users size={18} /></span><div><h2 className="text-sm font-extrabold">Personal details</h2><p className="mt-1 text-[10px] text-[#89958d]">Keep your contact information up to date.</p></div></div><div className="mt-6 space-y-4"><label className="block text-[10px] font-bold text-[#596a5f]">Full name<input {...form.register("name")} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6de] px-3.5 text-sm outline-none focus:border-[#70a888]" />{form.formState.errors.name?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{form.formState.errors.name.message}</span> : null}</label><label className="block text-[10px] font-bold text-[#596a5f]">Email address<input readOnly value={user.email} className="mt-1.5 h-11 w-full rounded-xl border border-[#e9ede7] bg-[#f8f9f6] px-3.5 text-sm text-[#839087] outline-none" /><span className="mt-1 block text-[9px] font-normal text-[#96a198]">Email cannot be changed here.</span></label><label className="block text-[10px] font-bold text-[#596a5f]">Phone number<input {...form.register("phone")} type="tel" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe6de] px-3.5 text-sm outline-none focus:border-[#70a888]" />{form.formState.errors.phone?.message ? <span role="alert" className="mt-1 block text-[9px] text-[#b4473f]">{form.formState.errors.phone.message}</span> : null}</label></div><button disabled={mutation.isPending} className="mt-5 h-10 rounded-lg bg-[#176b4d] px-4 text-xs font-extrabold text-white disabled:opacity-50">{mutation.isPending ? "Saving…" : "Save profile"}</button></form>
    <section className="rounded-2xl border border-[#e5ebe4] bg-white p-5 sm:p-6"><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#89958d]">Account type</p><p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eaf4eb] px-3 py-1.5 text-xs font-extrabold text-[#3d7952]"><Shield size={14} />{role}</p>{role === "COURIER" && user.courierProfile ? <div className="mt-6 space-y-3 border-t border-[#edf0eb] pt-5"><div className="flex justify-between text-xs"><span className="text-[#819087]">Availability</span><b>{user.courierProfile.availability}</b></div><div className="flex justify-between text-xs"><span className="text-[#819087]">Completed deliveries</span><b>{user.courierProfile.totalDeliveries}</b></div><div className="flex justify-between text-xs"><span className="text-[#819087]">Earnings balance</span><b>{money(user.courierProfile.earningsBalance)}</b></div></div> : null}<p className="mt-6 border-t border-[#edf0eb] pt-5 text-[11px] leading-5 text-[#829087]">Your role and access are controlled by the courier logistics API. Changes to account access should be requested from an administrator.</p></section>
  </div>;
}
