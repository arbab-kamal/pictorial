import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download } from "lucide-react";
import { Tables } from "@database.types";
import { DeleteImage } from "./DeleteImage";

interface ImageDialogProps {
  image: { url: string | undefined } & Tables<"generated_images">;
  onClose: () => void;
}
export function ImageDialog({ image, onClose }: ImageDialogProps) {
  const handleDownload = () => {
    fetch(image.url || "")
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `generated-image-${Date.now()}.${image?.output_format}`
        );

        // Append to the document and trigger the download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode?.removeChild(link);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="max-w-full sm:max-w-xl w-full">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl w-full">Image Details</SheetTitle>

          <ScrollArea className="flex flex-col h-[100vh]">
            <div className="relative w-fit h-fit ">
              <Image
                src={image.url || ""}
                alt={image.prompt || "Generated image"}
                width={image.width || 0}
                height={image.height || 0}
                className="w-full h-auto flex mb-3 rounded"
              />
              <div className="flex gap-4 absolute bottom-4 right-4">
                <Button
                  className="w-fit"
                  variant="default"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <DeleteImage
                  imageId={image.id.toString()}
                  imageName={image.image_name || ""}
                  onDelete={onClose}
                  className="w-fit"
                />
              </div>
            </div>
            <hr className="inline-block w-full border-primary/30 mb-2" />
            <p className="text-primary/90 w-full flex flex-col">
              <span className="text-primary text-xl font-semibold">Prompt</span>{" "}
              {image.prompt}
            </p>
            <hr className="inline-block w-full border-primary/30 my-3" />

            <div className="flex flex-wrap gap-3 mb-32">
              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 xs:text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">Model ID:</span>
                {image.model?.startsWith(
                  `${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/`
                )
                  ? image.model.split("/")[1].split(":")[0]
                  : image.model}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">
                  Aspect Ratio:
                </span>
                {image.aspect_ratio}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">
                  Dimensions:
                </span>
                {image.width}x{image.height}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">Guidance:</span>
                {image.guidance}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">
                  Inference Steps:
                </span>
                {image.num_inference_steps}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">
                  Output Format:
                </span>
                {image.output_format}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full border border-primary/30 px-4 py-2 text-sm font-normal"
              >
                <span className="font-semibold uppercase mr-2">
                  Created At:
                </span>
                {new Date(image.created_at).toLocaleString()}
              </Badge>
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
