import { useState } from "react";
import { Button } from "../button";
import FileUploader from "../file-uploader";
import { Input } from "../input";
import UploadImagePreview from "../upload-image-preview";
import { ChatHandler } from "./chat.interface";

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
  > & { assistantId: string, threadId: string| null, sendSlideNumber?: boolean }
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (imageUrl) {
      props.handleSubmit(e, {
        data: { imageUrl: imageUrl },
      });
      setImageUrl(null);
      return;
    }
    props.handleSubmit(e, {
      data: {
        assistantId: props.assistantId,
        threadId: props.threadId,
        sendSlideNumber:props.sendSlideNumber || false
      },
    });
  };
  const onRemovePreviewImage = () => setImageUrl(null);

  const handleUploadImageFile = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    setImageUrl(base64);
  };

  const handleUploadFile = async (file: File) => {
    try {
      if (file.type.startsWith("image/")) {
        return await handleUploadImageFile(file);
      }
      props.onFileUpload?.(file);
    } catch (error: any) {
      props.onFileError?.(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-4 shadow-xl space-y-4"
    >
      {imageUrl && (
        <UploadImagePreview url={imageUrl} onRemove={onRemovePreviewImage} />
      )}
      <div className="flex w-full items-start justify-between gap-4 flex-col sm:flex-row z-10 relative flex-wrap">
        <Input
          autoFocus
          name="message"
          placeholder="Type a message"
          className="md:flex-1 md:basis-40"
          value={props.input}
          onChange={props.handleInputChange}
        />
        <div className="flex gap-2">
          <FileUploader
            onFileUpload={handleUploadFile}
            onFileError={props.onFileError}
          />
          <Button type="submit" disabled={props.isLoading}>
            Send message
          </Button>
        </div>
      </div>
    </form>
  );
}
