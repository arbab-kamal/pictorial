import { Metadata } from "next";
import { ModelsList } from "@/components/models/ModelsList";
import { fetchModels } from "@/app/actions/model-actions";

export const metadata: Metadata = {
  title: "Models | Pictoria AI",
  description: "View and manage your trained models",
};

export default async function ModelsPage() {
  const data = await fetchModels();
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Models</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your trained models
        </p>
      </div>
      <ModelsList models={data} />
    </div>
  );
}
