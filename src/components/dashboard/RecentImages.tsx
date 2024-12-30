"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@database.types";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentImagesProps {
  images: Array<
    Tables<"generated_images"> & {
      url: string | undefined;
    }
  >;
}

export function RecentImages({ images }: RecentImagesProps) {
  if (images.length === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="text-muted-foreground mt-16">No images generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full xl:col-span-3">
      <CardHeader>
        <CardTitle>Recent Generations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem
                key={image.id}
                className="basis-full sm:basis-1/2 md:basis-1/3"
              >
                <div className="space-y-2">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-lg",
                      image.height && image.width
                        ? Number(image.width / image.height) === 1
                          ? "aspect-square"
                          : `aspect-[${image.width}/${image.height}]`
                        : "aspect-square"
                    )}
                  >
                    <Image
                      src={image.url || ""}
                      alt={image.prompt || "Generated image"}
                      width={image.width || 100}
                      height={image.height || 100}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.prompt}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href="/gallery">
              View Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
