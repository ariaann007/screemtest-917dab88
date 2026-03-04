import { useState } from "react";
import { DEMO_INVOICES } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ExternalLink, CreditCard, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Invoice } from "@/types";

function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-muted-foreground">Issued {new Date(invoice.issueDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {invoice.notes && <p className="text-sm text-muted-foreground">{invoice.notes}</p>}

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/30 border-b">
                <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Unit</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
              </tr></thead>
              <tbody>
                {invoice.lineItems.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">£{item.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-right font-medium">£{item.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-primary/5">
                  <td colSpan={3} className="p-3 font-bold text-right">Total</td>
                  <td className="p-3 text-right font-bold text-lg text-primary">£{invoice.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {invoice.status === "paid" && invoice.paidAt && (
            <div className="flex items-center gap-2 rounded-lg bg-success-light p-3 text-success text-sm">
              ✓ Paid on {new Date(invoice.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}

          {invoice.status === "unpaid" && (
            <div className="rounded-lg bg-warning-light border border-warning/20 p-3 text-sm text-warning">
              Due {new Date(invoice.dueDate).toLocaleDateString("en-GB")}
            </div>
          )}
        </div>

        <div className="p-5 border-t flex gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          {invoice.status !== "paid" && (
            <Button className="flex-1 gap-2">
              <CreditCard className="h-4 w-4" /> Pay Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { currentTenant } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const invoices = DEMO_INVOICES.filter(i => currentTenant ? i.tenantId === currentTenant.id : true);

  const filtered = invoices.filter(i => {
    const matchSearch = !search || i.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUnpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}

      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Invoices and payment management</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unpaid", value: `£${totalUnpaid.toLocaleString()}`, count: invoices.filter(i => i.status === "unpaid").length, color: "text-destructive" },
          { label: "Pending", value: `£${totalPending.toLocaleString()}`, count: invoices.filter(i => i.status === "pending").length, color: "text-warning" },
          { label: "Paid (all time)", value: `£${totalPaid.toLocaleString()}`, count: invoices.filter(i => i.status === "paid").length, color: "text-success" },
        ].map(s => (
          <div key={s.label} className="card-stat">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-bold mt-1", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.count} invoice{s.count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Issued</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Due</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices found</td></tr>}
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                <td className="p-3 font-mono text-xs font-medium">{inv.invoiceNumber}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{inv.notes}</td>
                <td className="p-3">{new Date(inv.issueDate).toLocaleDateString("en-GB")}</td>
                <td className="p-3 text-sm">{new Date(inv.dueDate).toLocaleDateString("en-GB")}</td>
                <td className="p-3 font-bold">£{inv.total.toLocaleString()}</td>
                <td className="p-3"><StatusBadge status={inv.status} /></td>
                <td className="p-3">
                  <div className="flex items-center gap-1 justify-end">
                    {inv.status !== "paid" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={e => e.stopPropagation()}>
                        <CreditCard className="h-3 w-3 mr-1" /> Pay
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={e => e.stopPropagation()}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
