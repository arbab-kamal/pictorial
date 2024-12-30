"use client";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Info } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "../ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import useGenerateStore from "@/store/useGenerateStore";
import { Tables } from "@database.types";

interface ConfigurationsProps {
  userModels: Tables<"models">[];
  model_id?: string;
}

const formSchema = z.object({
  model: z.string().min(1, { message: "Model is required" }),
  prompt: z.string().min(1, { message: "Prompt is required" }),
  aspect_ratio: z.string().min(1, { message: "Aspect ratio is required" }),
  //   prompt_strenght: z.number().min(1, { message: "Prompt strength is required" }),
  guidance: z.number().min(1, { message: "Guidance scale is required" }),
  num_outputs: z
    .number()
    .min(1, { message: "Number of outputs is required" })
    .max(4, { message: "Number of outputs must be less than 4" }),
  num_inference_steps: z
    .number()
    .min(1, { message: "Number of inference steps is required" })
    .max(50, { message: "Number of inference steps must be less than 50" }),
  output_format: z.string().min(1, { message: "Output format is required" }),
  output_quality: z
    .number()
    .min(1, { message: "Output quality is required" })
    .max(100, { message: "Output quality must be less than 100" }),
});

const Configurations = ({ userModels, model_id }: ConfigurationsProps) => {
  const generateImage = useGenerateStore((state) => state.generateImage);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: model_id
        ? `${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${model_id}`
        : "black-forest-labs/flux-dev", 
      prompt: "", 
      aspect_ratio: "1:1", 
      // prompt_strenght: 0.8,
      guidance: 3.5,
      num_outputs: 1, 
      num_inference_steps: 28,
      output_format: "webp",
      output_quality: 80,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newValues = {
      ...values,
      prompt: values.model.startsWith(
        `${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/`
      )
        ? (() => {
            const modelId = values.model
              .replace(`${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/`, "")
              .split(":")[0];
            const selectedModel = userModels.find(
              (model) => model.model_id === modelId
            );
            return `photo of ${selectedModel?.trigger_word || "ohwx"} ${
              selectedModel?.gender
            }, ${values.prompt}`;
          })()
        : values.prompt,
    };

    await generateImage(newValues);
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "model") {
        let newSteps;
        if (value.model === "black-forest-labs/flux-schnell") {
          newSteps = 4;
        } else if (value.model === "black-forest-labs/flux-dev") {
          newSteps = 28;
        } else if (
          value?.model?.startsWith(
            `${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/`
          )
        ) {
          newSteps = 28; // Default value for custom models
        }
        if (newSteps !== undefined) {
          form.setValue("num_inference_steps", newSteps);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  return (
    <TooltipProvider>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid w-full items-start gap-6"
        >
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-background">
            <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Model{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You can select any model from the dropdown menu.</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="black-forest-labs/flux-schnell">
                        Flux Schnell
                      </SelectItem>
                      <SelectItem value="black-forest-labs/flux-dev">
                        Flux Dev
                      </SelectItem>
                      {userModels?.map(
                        (model) =>
                          model.training_status === "succeeded" && (
                            <SelectItem
                              key={model.id}
                              value={`${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${model.model_id}:${model.version}`}
                            >
                              {model.model_name ?? ""}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-scols-1 xl:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aspect_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Aspect Ratio{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aspect ratio for the generated image</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="9:16">9:16</SelectItem>
                        <SelectItem value="21:9">21:9</SelectItem>
                        <SelectItem value="9:21">9:21</SelectItem>
                        <SelectItem value="4:5">4:5</SelectItem>
                        <SelectItem value="5:4">5:4</SelectItem>
                        <SelectItem value="4:3">4:3</SelectItem>
                        <SelectItem value="3:4">3:4</SelectItem>
                        <SelectItem value="2:3">2:3</SelectItem>
                        <SelectItem value="3:2">3:2</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="num_outputs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Number of outputs
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of outputs to generate</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={4}
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
          control={form.control}
          name="prompt_strenght"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='flex items-center justify-between'>
<div className="flex items-center gap-2">
Prompt strength <Tooltip>
    <TooltipTrigger>
        <Info className='w-4 h-4' />
    </TooltipTrigger>
    <TooltipContent>
      <p>Prompt strength when using img2img. 1.0 corresponds to full destruction of information in image</p>
    </TooltipContent>
  </Tooltip>
</div>

<span className="text-sm text-muted-foreground">{field.value}</span>

              </FormLabel>
              <FormControl>
                <Slider defaultValue={[field.value]} min={0} max={1} step={0.1} onValueChange={value => field.onChange(value[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

            <FormField
              control={form.control}
              name="guidance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Guidance{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Guidance for generated image</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {field.value}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_inference_steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Number of inference steps{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Number of denoising steps. Recommended range is
                            28-50 for dev model and 1-4 for schnell model.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {field.value}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={1}
                      max={
                        form.getValues("model") ===
                        "black-forest-labs/flux-schnell"
                          ? 4
                          : 50
                      }
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="output_quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Output quality{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Quality when saving the output images, from 0 to
                            100. 100 is best quality, 0 is lowest quality.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {field.value}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={50}
                      max={100}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="output_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Output format{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Format of the output images.</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a output format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Prompt{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Prompt for generated image</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="font-medium">
              Generate
            </Button>
          </fieldset>
        </form>
      </Form>
    </TooltipProvider>
  );
};

export default Configurations;
