import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganisationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation</h1>
        <p className="text-muted-foreground text-sm">Manage departments, teams, and org structure</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-5 w-5 text-primary" />
            Organisation Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Organisation chart and structure coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
