import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ConvexTest() {
  const data = useQuery(api.test.hello);

  return (
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {data ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          Convex Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-2">
            <p className="text-green-700 font-semibold">{data.message}</p>
            <p className="text-sm text-muted-foreground">
              Status: {data.status}
            </p>
            <p className="text-xs text-muted-foreground">
              Timestamp: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">Connecting to Convex...</p>
        )}
      </CardContent>
    </Card>
  );
}
