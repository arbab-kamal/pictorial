"use client";

import { useState } from "react";
import { ImageDialog } from "./ImageDialog";
import { Tables } from "@database.types";
import Image from "next/image";

type ImageProps = {
  url: string | undefined;
} & Tables<"generated_images">;

interface GalleryProps {
  images: ImageProps[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        No images found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <div key={`${image.id}-${index}`} className="break-inside-auto">
            <div
              className="relative group overflow-hidden cursor-pointer transition-transform"
              onClick={() =>
                setSelectedImage(
                  image as { url: string } & Tables<"generated_images">
                )
              }
            >
              {/* let's create overlay on hover */}
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-70 rounded">
                <div className="flex items-center justify-center h-full ">
                  <p className="text-white text-lg font-semibold">
                    View Details
                  </p>
                </div>
              </div>
              <Image
                src={image.url || ""}
                alt={image.prompt || "Generated image"}
                width={image.width || 0}
                height={image.height || 0}
                className="object-cover rounded"
              />
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
