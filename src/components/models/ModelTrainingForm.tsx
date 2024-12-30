"use client";

import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getPresignedStorageUrl } from "@/app/actions/image-actions";


// Define constants for file type and size validation
const ACCEPTED_ZIP_TYPES = ["application/x-zip-compressed", "application/zip"];
const MAX_FILE_SIZE = 45 * 1024 * 1024; // 45MB

const formSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  gender: z.enum(["man", "woman"], {
    required_error: "You need to select a gender.",
  }),
  zipFile: z
    .any()
    .refine((files) => files?.[0] instanceof File, "Please select a file")
    .refine(
      (file) => file?.[0]?.type && ACCEPTED_ZIP_TYPES.includes(file[0].type),
      "Only zip files are accepted"
    )
    .refine(
      (file) => file?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size allowed is 5MB"
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function ModelTrainingForm() {
  const toastId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelName: "",
      zipFile: undefined,
      gender: "man",
    },
  });
  const fileRef = form.register("zipFile");

  async function onSubmit(values: FormValues) {
    toast.loading("Uploading file...", { id: toastId });
    setIsUploading(true);

    try {
      const data = await getPresignedStorageUrl(values.zipFile[0].name);
      if (data.error) {
        toast.error(data.error || "Failed to upload the file!", {
          id: toastId,
        });
        setIsUploading(false);
        toast.dismiss(toastId);
        return;
      }
      const urlResponse = await fetch(data.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": values.zipFile[0].type, // Ensure to set the correct content type
        },
        body: values.zipFile[0],
      });

      if (!urlResponse.ok) {
        throw new Error(`Upload failed!`);
      }
      const res = await urlResponse.json();

      toast.success("File uploaded successfully!", {
        id: toastId,
      });

      const formData = new FormData();
      formData.append("fileKey", res.Key);
      formData.append("modelName", values.modelName);
      formData.append("gender", values.gender);

      toast.loading("Initiating model training...", {
        id: toastId,
      });

      const response = await fetch("/api/train", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || result?.error) {
        throw new Error(result?.error || "Failed to train model");
      }
      if (result.error) {
        throw new Error(result.error || "Failed to train model");
      }

      toast.success(
        "Training started successfully! You'll receive notification once it gets completed!",
        { id: toastId, duration: 5000 }
      );

    } catch (error) {
      console.log("Error in ModelTrainingForm catch block", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start training",
        { id: toastId, duration:5000 }
      );
    } finally {
      setIsUploading(false);
      // toast.dismiss(toastId);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset className="grid gap-6 rounded-lg border p-4 sm:p-8 bg-background max-w-5xl">
          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter model name" {...field} />
                </FormControl>
                <FormDescription>
                  This will be the name of your trained model.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Please select the gender of the images</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="man" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="woman" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipFile"
            render={() => (
              <FormItem>
                <FormLabel>Training Data (Zip File) | <span className="text-destructive">Read the requirements below</span></FormLabel>
                <div className="mb-4 rounded-lg text-card-foreground shadow-sm pb-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Provide 10, 12 or 15 images in total</li>
                    <li>• Ideal breakdown for 12 images:
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- 6 face closeups</li>
                        <li>- 3/4 half body closeups (till stomach)</li>
                        <li>- 2/3 full body shots</li>
                      </ul>
                    </li>
                    <li>• No accessories on face/head ideally</li>
                    <li>• No other people in images</li>
                    <li>• Different expressions, clothing, backgrounds with good lighting</li>
                    <li>• Images to be in 1:1 resolution (1048x1048 or higher)</li>
                    <li>• Use images of similar age group (ideally within past few months)</li>
                    <li>• Provide only zip file (under 45MB size)</li>
                  </ul>
                </div>
                <FormControl>
                  <Input
                    type="file"
                    accept=".zip"
                    {...fileRef}
                  />
                </FormControl>
                <FormDescription>
                  Upload a zip file containing your training images (max 45MB).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isUploading} className="w-fit">
            {isUploading ? "Uploading..." : "Start Training"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
