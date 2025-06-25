"use client";

// import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { NotesInput } from "./issues/issue-fields";

export default function FileUploadCircularProgressDemo() {
  // const [files, setFiles] = React.useState<File[]>([]);
  const [files, setFiles] = React.useState([]);

  //   const onUpload = React.useCallback(
  //     async (
  //       files: File[],
  //       {
  //         onProgress,
  //         onSuccess,
  //         onError,
  //       }: {
  //         onProgress: (file: File, progress: number) => void;
  //         onSuccess: (file: File) => void;
  //         onError: (file: File, error: Error) => void;
  //       },
  //     ) => {
  const onUpload = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      // console.log({files})
      try {
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            // Simulate file upload with progress
            const totalChunks = 10;
            let uploadedChunks = 0;

            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Simulate network delay (100-300ms per chunk)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100)
              );

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed")
            );
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
      }
    },
    []
  );

  //   const onFileReject = React.useCallback((file: File, message: string) => {
  const onFileReject = React.useCallback((file, message) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);
  const [showFileMeta, setShowFileMeta] = React.useState(false);
  //   return (
  //     <div
  //       onMouseEnter={() => setIsHovering(true)}
  //       onMouseLeave={() => setIsHovering(false)}
  //       style={{
  //         backgroundColor: isHovering ? 'lightblue' : 'lightgray',
  //         padding: '20px',
  //         borderRadius: '5px',
  //         cursor: 'pointer',
  //       }}
  //     >
  //       Hover Over Me
  //       {isHovering && <p>I am visible on hover!</p>}
  //     </div>
  //   )
  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      maxFiles={10}
      maxSize={5 * 1024 * 1024}
      className="w-full max-w-md"
      onUpload={onUpload}
      onFileReject={onFileReject}
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max 10 files, up to 5MB each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList orientation="horizontal">
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="p-0">
            <FileUploadItemPreview className="size-20 [&>svg]:size-12">
              <FileUploadItemProgress circular size={36} />
            </FileUploadItemPreview>
            <FileUploadItemMetadata
              className={cn(showFileMeta ? null : "sr-only")}
            />
            <FileUploadItemDelete asChild>
              <Button
                variant="secondary"
                size="icon"
                className="-top-1 -right-1 absolute size-5 rounded-full"
              >
                <X className="size-3" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
      <div>
        <Checkbox
          id="filemeta"
          onCheckedChange={(e) => setShowFileMeta((prev) => !prev)}
        />
        <label
          htmlFor="filemeta"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show file details
        </label>
      </div>
    </FileUpload>
  );
}

const formSchema = z.object({
  files: z
    // .array(z.custom<File>())
    .array(z.custom())
    .min(1, "Please select at least one file")
    .max(2, "Please select up to 2 files")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["files"],
    }),
});

// type FormValues = z.infer<typeof formSchema>;

export function FileUploadFormDemo() {
  // const form = useForm<FormValues>({
  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
    },
  });

  // const onSubmit = React.useCallback((data: FormValues) => {
  const onSubmit = React.useCallback((data) => {
    console.log({ ...data });
    toast("Submitted values:", {
      description: (
        <pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
          <code>
            {JSON.stringify(
              data.files.map((file) =>
                file.name.length > 25
                  ? `${file.name.slice(0, 25)}...`
                  : file.name
              ),
              null,
              2
            )}
          </code>
        </pre>
      ),
    });
  }, []);
  const dataRef = React.useRef({ notes: null });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <NotesInput dataRef={dataRef} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onValueChange={field.onChange}
                  accept="image/*"
                  maxFiles={2}
                  maxSize={5 * 1024 * 1024}
                  onFileReject={(_, message) => {
                    form.setError("files", {
                      message,
                    });
                  }}
                  multiple
                >
                  <FileUploadDropzone className="flex-row border-dotted">
                    <CloudUpload className="size-4" />
                    Drag and drop or
                    <FileUploadTrigger asChild>
                      <Button variant="link" size="sm" className="p-0">
                        choose files
                      </Button>
                    </FileUploadTrigger>
                    to upload
                  </FileUploadDropzone>
                  <FileUploadList>
                    {field.value.map((file, index) => (
                      <FileUploadItem key={index} value={file}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <X />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </FormControl>
              <FormDescription>
                Upload up to 2 images up to 5MB each.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}

// export default FileUploadCircularProgressDemo
