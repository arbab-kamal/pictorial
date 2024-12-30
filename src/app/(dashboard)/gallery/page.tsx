import React from "react";
import { Gallery } from "@/components/gallery/Gallery";
import { getImages } from "@/app/actions/image-actions";
import { Metadata } from "next";

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Gallery | Pictoria AI",
  description: "Gallery for Pictoria AI",
};

export default async function GalleryPage() {
  const { data: images } = await getImages();
  return (
    <div className="container mx-auto ">
      <h1 className="text-3xl font-semibold mb-2">My Images</h1>
      <p className="text-muted-foreground mb-6">
        Here you can see all the images you have generated. Click on an image to
        view details.
      </p>
      <Gallery images={images || []} />
    </div>
  );
}
