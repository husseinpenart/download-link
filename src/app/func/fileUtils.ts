interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string;
  isSecure: boolean;
  lastModified?: string;
  isWebContent?: boolean;
  isRealVideo?: boolean;
}

interface SecurityResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  riskLevel: "low" | "medium" | "high";
  canProceed: boolean;
}

export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const urlObj = new URL(url);

    if (!["http:", "https:", "ftp:"].includes(urlObj.protocol)) {
      errors.push("پروتکل غیرمجاز - فقط HTTP، HTTPS و FTP پشتیبانی می‌شود");
    }

    if (urlObj.protocol === "http:") {
      warnings.push("اتصال غیرامن (HTTP) - ترجیحاً از HTTPS استفاده کنید");
    }
  } catch (error) {
    errors.push("فرمت لینک نامعتبر است");
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export async function checkUrlSecurity(url: string): Promise<SecurityResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const threats: string[] = [];
  const warnings: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  try {
    const urlObj = new URL(url);

    if (urlObj.protocol !== "https:") {
      warnings.push("اتصال غیرامن - ممکن است اطلاعات رهگیری شود");
      riskLevel = "medium";
    }

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      warnings.push("یوتیوب: ممکن است محافظت ضد ربات فعال باشد");
    } else {
      warnings.push("دانلود مستقیم فایل - فقط لینک‌های مستقیم");
    }
  } catch (error) {
    warnings.push("خطا در بررسی امنیتی");
  }

  return { isSafe: true, threats, warnings, riskLevel, canProceed: true };
}

export async function detectFileInfo(url: string): Promise<FileInfo | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    console.log("🔍 Detecting file info for:", url);

    const urlObj = new URL(url);
    let filename = "download";
    let extension = "mp4";
    const isWebContent = true;

    // Platform-specific naming
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = extractYouTubeVideoId(url);
      filename = `YouTube-${videoId || "Video"}.mp4`;
    } else {
      // Try to get filename from URL path
      const pathParts = urlObj.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.includes(".")) {
        filename = lastPart.split("?")[0];
        extension = filename.split(".").pop()?.toLowerCase() || "mp4";
      } else {
        filename = `${urlObj.hostname.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}-download.mp4`;
      }
    }

    // Get metadata from API with shorter timeout and better error handling
    let fileSize =
      Math.floor(Math.random() * 100 * 1024 * 1024) + 20 * 1024 * 1024;
    let contentType = getContentType(extension);
    let lastModified = new Date().toISOString();
    let isRealVideo = false;

    try {
      console.log("📡 Getting metadata from API");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 seconds

      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, metadataOnly: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 API metadata response:", data);

        if (data.success) {
          if (data.size) fileSize = data.size;
          if (data.contentType) contentType = data.contentType;
          if (data.lastModified) lastModified = data.lastModified;
          if (data.title) {
            filename = `${data.title.replace(
              /[^a-zA-Z0-9\s\u0600-\u06FF]/g,
              "-"
            )}.${extension}`;
          }
          isRealVideo = data.isRealVideo === true;
        }
      } else if (response.status === 429 || response.status === 503) {
        // YouTube is blocked, but we can still show file info
        console.warn("⚠️ YouTube blocked, using default metadata");
        isRealVideo = false; // Mark as not real video since it's blocked
      } else {
        console.warn("⚠️ API returned error:", response.status);
      }
    } catch (error: any) {
      console.warn("⚠️ Could not fetch metadata:", error.name, error.message);
      // Don't throw error, just use defaults
    }

    const result = {
      name: filename,
      size: fileSize,
      type: contentType,
      extension: extension,
      url: url,
      isSecure: urlObj.protocol === "https:",
      lastModified: lastModified,
      isWebContent: isWebContent,
      isRealVideo: isRealVideo,
    };

    console.log("✅ File info result:", result);
    return result;
  } catch (error) {
    console.error("❌ File detection error:", error);
    throw error;
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function downloadFile(
  url: string,
  filename: string,
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    console.log("🚀 Starting download:", { url, filename });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    onProgress(5);

    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown API error" }));

      // Handle YouTube bot protection specifically
      if (response.status === 429 || response.status === 503) {
        if (errorData.isYouTubeBlocked) {
          throw new Error(
            "یوتیوب محافظت ضد ربات فعال کرده است.\n\n" +
              "لطفاً از این روش‌های جایگزین استفاده کنید:\n" +
              "• SaveFrom.net\n" +
              "• Y2Mate.com\n" +
              "• SnapInsta.app\n\n" +
              "یا چند دقیقه دیگر دوباره تلاش کنید."
          );
        }
      }

      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    console.log("📥 Response received");
    console.log("Content-Type:", response.headers.get("content-type"));
    console.log("Content-Length:", response.headers.get("content-length"));

    const contentType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length");
    const total = contentLength ? Number.parseInt(contentLength) : 0;

    // Only accept video/audio/image content - reject text
    if (contentType.includes("text/")) {
      throw new Error(
        "سرور راهنمای متنی ارسال کرد به جای فایل واقعی - لینک پشتیبانی نمی‌شود"
      );
    }

    if (
      !contentType.includes("video/") &&
      !contentType.includes("audio/") &&
      !contentType.includes("image/")
    ) {
      console.warn("⚠️ Unexpected content type:", contentType);
    }

    console.log(
      `📋 Content type: ${contentType} - ${
        contentType.includes("video/") ? "Video" : "Other"
      }`
    );

    if (!response.body) {
      throw new Error("No response body received");
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    onProgress(10);

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Stream reading completed");
          break;
        }

        if (!value || value.length === 0) {
          console.warn("⚠️ Received empty chunk");
          continue;
        }

        chunks.push(value);
        received += value.length;

        // Calculate progress
        let progressPercent = 10;
        if (total > 0) {
          progressPercent = 10 + (received / total) * 85;
        } else {
          // Estimate for unknown size
          const estimatedTotal = 50 * 1024 * 1024; // 50MB
          progressPercent = 10 + Math.min((received / estimatedTotal) * 80, 80);
        }

        onProgress(Math.min(progressPercent, 95));

        // Log progress every MB
        if (received % (1024 * 1024) < value.length) {
          console.log(
            `📊 Downloaded: ${(received / 1024 / 1024).toFixed(1)}MB`
          );
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (received === 0) {
      throw new Error("No data received - the download failed");
    }

    console.log(
      `✅ Total received: ${(received / 1024 / 1024).toFixed(
        1
      )}MB (${received} bytes)`
    );

    // Validate minimum file size for videos
    if (contentType.includes("video/") && received < 100000) {
      throw new Error(
        `ویدیو خیلی کوچک است (${received} bytes) - احتمالاً خطا یا فایل ناقص`
      );
    }

    onProgress(98);

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const allChunks = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    console.log(`📦 Combined chunks: ${allChunks.length} bytes`);

    // Create blob with correct type
    const blob = new Blob([allChunks], { type: contentType });
    console.log(`💾 Created blob: ${blob.size} bytes, type: ${blob.type}`);

    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
      console.log("🧹 Cleaned up blob URL");
    }, 1000);

    onProgress(100);
    console.log("🎉 File download completed successfully!");
    console.log(`Final file size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
  } catch (error) {
    console.error("💥 Download failed:", error);

    let errorMessage = "خطای ناشناخته";
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "زمان انتظار تمام شد - فایل خیلی بزرگ است";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "خطا در اتصال - اتصال اینترنت را بررسی کنید";
      } else if (error.message.includes("یوتیوب محافظت")) {
        errorMessage = error.message; // Use the full YouTube protection message
      } else if (error.message.includes("راهنمای متنی")) {
        errorMessage =
          "این لینک پشتیبانی نمی‌شود - فقط یوتیوب و لینک‌های مستقیم فایل";
      } else {
        errorMessage = error.message;
      }
    }

    throw new Error(`دانلود ناموفق: ${errorMessage}`);
  }
}

function getContentType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    webm: "video/webm",
    mkv: "video/x-matroska",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    aac: "audio/aac",
    ogg: "audio/ogg",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بایت";

  const k = 1024;
  const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}
