"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteImage } from "@/app/actions/image-actions";
import { useId } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeleteImageProps {
  imageId: string;
  imageName: string;
  onDelete?: () => void;
  className?: string;
}

export function DeleteImage({
  imageId,
  imageName,
  onDelete,
  className,
}: DeleteImageProps) {
  const toastId = useId();

  const handleDelete = async () => {
    toast.loading("Deleting image...", { id: toastId });
    const { error, success } = await deleteImage(imageId, imageName);

    if (error) {
      console.error(error);
      toast.error(error, { id: toastId });
    } else if (success) {
      toast.success("Image deleted successfully", { id: toastId });
      onDelete?.();
    } else {
      toast.dismiss(toastId);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className={cn("w-fit", className)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            image.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
