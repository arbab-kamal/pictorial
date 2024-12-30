import ModelTrainingForm from "@/components/models/ModelTrainingForm";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Training | Pictoria AI",
  description: "Model training for Pictoria AI",
};

export const maxDuration = 30;

export default function ModelTrainingPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-2">Train Model</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Train a new model with your own images.
      </p>
      <ModelTrainingForm />
    </div>
  );
}
