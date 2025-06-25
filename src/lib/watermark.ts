interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: string;
  angle?: number;
  spacing?: number;
  repeat?: boolean;
}

export async function addWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const type = file.type.split("/")[0];

  switch (type) {
    case "image":
      return addImageWatermark(file, options);
    case "video":
      return addVideoWatermark(file, options);
    case "application":
      return addDocumentWatermark(file, options);
    default:
      throw new Error("Unsupported file type for watermarking");
  }
}

async function addImageWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark
      const {
        text,
        opacity = 0.3,
        fontSize = img.width * 0.05,
        color = "rgba(0, 0, 0, 0.5)",
        angle = -45,
        spacing = img.width * 0.2,
        repeat = true,
      } = options;

      // Apply watermark settings
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.font = \`\${fontSize}px Arial\`;
      ctx.fillStyle = color;
      ctx.rotate((angle * Math.PI) / 180);

      if (repeat) {
        // Create repeating pattern
        const textWidth = ctx.measureText(text).width;
        const pattern = {
          width: textWidth + spacing,
          height: fontSize + spacing,
        };

        // Calculate pattern repetition
        const repeatX = Math.ceil(
          (Math.sqrt(canvas.width ** 2 + canvas.height ** 2) * 2) / pattern.width
        );
        const repeatY = Math.ceil(
          (Math.sqrt(canvas.width ** 2 + canvas.height ** 2) * 2) / pattern.height
        );

        // Draw repeating watermark
        for (let x = -repeatX; x < repeatX; x++) {
          for (let y = -repeatY; y < repeatY; y++) {
            ctx.fillText(
              text,
              x * pattern.width,
              y * pattern.height
            );
          }
        }
      } else {
        // Draw single centered watermark
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(
          text,
          (canvas.width - textWidth) / 2,
          canvas.height / 2
        );
      }

      ctx.restore();

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create watermarked image"));
          }
        },
        file.type,
        0.95
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

async function addVideoWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  // For video watermarking, we'll need to use a video processing library
  // like FFmpeg.js or a server-side solution
  throw new Error("Video watermarking not implemented yet");
}

async function addDocumentWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  // For document watermarking, we'll need to use PDF.js or a similar library
  // depending on the document type
  throw new Error("Document watermarking not implemented yet");
}

export function generateWatermarkText(content: {
  id: string;
  user_id: string;
  created_at: string;
}): string {
  const timestamp = new Date(content.created_at).getTime();
  return `Protected • ID: ${content.id.slice(0, 8)} • TS: ${timestamp}`;
} 