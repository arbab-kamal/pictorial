"use client";
import React from "react";
import useGenerateStore from "@/store/useGenerateStore";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "../ui/card";
import { CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

const GeneratedImages = () => {
  const images = useGenerateStore((state) => state.images);
  const loading = useGenerateStore((state) => state.loading);

 if(images.length === 0) return <Card className="w-full max-w-2xl bg-muted">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl">
                    {loading ? "Loading..." : "There are no images generated"}
                  </span>
                </CardContent>
              </Card>
  return (
    <Carousel className="w-full max-w-2xl ">
      <CarouselContent>
        {loading || images.length === 0 ? (
          <CarouselItem>
            <div className="p-1">
              <Card className="border-none">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl">
                    {loading ? "Loading..." : "No images generated"}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ) : (
          images.map((image, index) => {
            const aspectRatio = image.aspect_ratio.replace(':', '/')
            return (
              <CarouselItem key={index}>
                <div
                  className={cn(
                    "relative flex items-center justify-center rounded-lg overflow-hidden",
                    `${aspectRatio === "1/1" ? "aspect-square" : aspectRatio === '16/9' ? 'aspect-video' : `aspect-[${aspectRatio}]`}`
                  )}
                >
                  <Image
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    className="object-cover w-full h-full"
                    fill
                  />
                </div>
              </CarouselItem>
            );
          })
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default GeneratedImages;
