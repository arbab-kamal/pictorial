"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@database.types";

interface RecentModelsProps {
  models: Database["public"]["Tables"]["models"]["Row"][];
}

export function RecentModels({ models }: RecentModelsProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Recent Models</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {models.length === 0 ? (
            <p className="text-muted-foreground">No models trained yet</p>
          ) : (
            models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between space-x-4"
              >
                <div>
                  <p className="text-sm font-medium">{model.model_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {model.gender}
                  </p>
                </div>
                <Badge variant={getStatusVariant(model.training_status)}>
                  {model.training_status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(
  status: Database["public"]["Enums"]["training_status"] | null
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "succeeded":
      return "default";
    case "processing":
    case "starting":
      return "secondary";
    case "failed":
    case "canceled":
      return "destructive";
    default:
      return "secondary";
  }
}
