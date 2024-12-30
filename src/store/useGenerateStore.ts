import { create } from 'zustand'
import { toast } from 'sonner'
import { generateImage as generateImageAction, storeImages } from '@/app/actions/image-actions'

interface GenerateState {
  loading: boolean
  images: Array<{ url: string } & GenerateFormValues>
  error: string | null
  generateImage: (values: GenerateFormValues) => Promise<void>
}

interface GenerateFormValues {
  model: string;
  prompt: string;
  num_inference_steps: number;
  num_outputs: number;
  guidance: number;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
}

const useGenerateStore = create<GenerateState>((set) => ({
  loading: false,
  images: [],
  error: null,

  generateImage: async (values: GenerateFormValues) => {
    set({ loading: true, error: null })
    const toastId = toast.loading('Generating image...')

    try {
      const { data:output, error, success } = await generateImageAction(values)
      if (!success) {
        set({ error: error, loading: false })
        toast.error(error, { id: toastId })
        return
      }
      const dataWithInputs = Array.isArray(output) ? output.map((url: string) => ({
        url,
        ...values,
      })) : []

      set({ images: dataWithInputs, loading: false })
      toast.success("Image generated successfully", { id: toastId })

      // Store the generated images
      await storeImages(dataWithInputs)
      toast.success("Images stored successfully")

    } catch (error) {
      console.error(error)
      set({ error: 'Failed to generate image. Please try again.', loading: false })
      toast.error("Failed to generate image. Please try again.", { id: toastId })
    }
  },
}))

export default useGenerateStore
