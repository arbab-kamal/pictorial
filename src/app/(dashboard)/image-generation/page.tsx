import { fetchModels } from "@/app/actions/model-actions";
import Configurations from "@/components/image-generation/Configurations";
import GeneratedImages from "@/components/image-generation/GeneratedImages";
import { Metadata } from 'next'

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Image Generation | Pictoria AI",
  description: "Image generation for Pictoria AI",
}

import React from "react";
interface SearchParams {
  model_id?: string
}

export default async function ImageGenerationPage({searchParams}: {searchParams: Promise<SearchParams>}) {
  const model_id = (await searchParams).model_id;
  const {data: userModels} = await fetchModels();

  return (
    <section className="container mx-auto grid flex-1 gap-4 overflow-auto grid-cols-1 lg:grid-cols-3">
      <Configurations userModels={userModels || []} model_id={model_id} />
      <div className="relative flex h-fit flex-col items-center justify-center rounded-xl p-0 lg:p-4 lg:col-span-2">
        <GeneratedImages />
        <div className="flex-1" />
      </div>
    </section>
  );
}
