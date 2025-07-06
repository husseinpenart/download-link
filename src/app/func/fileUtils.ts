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
}

interface SecurityResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  riskLevel: "low" | "medium" | "high";
  canProceed: boolean;
}

// Allowed file extensions (expanded list)
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "tiff",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
  "webm",
  "m4v",
  "mp3",
  "wav",
  "flac",
  "aac",
  "ogg",
  "wma",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "bz2",
  "exe",
  "msi",
  "dmg",
  "deb",
  "rpm",
  "apk",
  "html",
  "htm",
  "css",
  "js",
  "json",
  "xml",
];

// High-risk domains that should show strong warnings
const HIGH_RISK_DOMAINS = [
  "malware-site.com",
  "phishing-example.net",
  "suspicious-downloads.org",
];

// Maximum file size (10GB in bytes) - increased limit
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic URL format validation
  try {
    const urlObj = new URL(url);

    // Check protocol - only block dangerous protocols
    if (!["http:", "https:", "ftp:"].includes(urlObj.protocol)) {
      errors.push("پروتکل غیرمجاز - فقط HTTP، HTTPS و FTP پشتیبانی می‌شود");
    }

    // Check for high-risk domains (warning, not blocking)
    if (HIGH_RISK_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      warnings.push("این دامنه در لیست پرخطر قرار دارد");
    }

    // Warn about shortened URLs but don't block
    if (
      urlObj.hostname.includes("bit.ly") ||
      urlObj.hostname.includes("tinyurl") ||
      urlObj.hostname.includes("t.co")
    ) {
      warnings.push("لینک کوتاه شده - ممکن است به آدرس نامعلومی منتقل شود");
    }

    // Warn about IP addresses but don't block
    if (/^\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname)) {
      warnings.push(
        "استفاده از آدرس IP - ممکن است نشان‌دهنده محتوای مشکوک باشد"
      );
    }

    // Warn about non-HTTPS
    if (urlObj.protocol === "http:") {
      warnings.push("اتصال غیرامن (HTTP) - اطلاعات شما رمزگذاری نمی‌شود");
    }
  } catch (error) {
    errors.push("فرمت لینک نامعتبر است");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function checkUrlSecurity(url: string): Promise<SecurityResult> {
  // Simulate security check delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const threats: string[] = [];
  const warnings: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  try {
    const urlObj = new URL(url);

    // Check HTTPS - major factor for risk level
    if (urlObj.protocol !== "https:") {
      warnings.push("اتصال غیرامن (HTTP) - خطر رهگیری اطلاعات");
      riskLevel = "medium";
    }

    // Check for suspicious patterns (warnings, not threats)
    const suspiciousPatterns = ["download-now", "free-crack", "keygen"];
    const highRiskPatterns = ["malware", "virus", "trojan"];

    if (
      highRiskPatterns.some((pattern) => url.toLowerCase().includes(pattern))
    ) {
      threats.push("الگوی خطرناک در لینک شناسایی شد");
      riskLevel = "high";
    } else if (
      suspiciousPatterns.some((pattern) => url.toLowerCase().includes(pattern))
    ) {
      warnings.push("الگوی مشکوک در لینک شناسایی شد");
      riskLevel = riskLevel === "high" ? "high" : "medium";
    }

    // Check for known video/content platforms
    const contentPlatforms = [
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "dailymotion.com",
      "twitch.tv",
    ];
    if (
      contentPlatforms.some((platform) => urlObj.hostname.includes(platform))
    ) {
      warnings.push(
        "پلتفرم محتوا - ممکن است نیاز به ابزار خاص برای دانلود داشته باشد"
      );
      riskLevel = "low"; // Content platforms are generally safe
    }

    // Check for social media platforms
    const socialPlatforms = [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
    ];
    if (
      socialPlatforms.some((platform) => urlObj.hostname.includes(platform))
    ) {
      warnings.push("پلتفرم اجتماعی - ممکن است محتوا قابل دانلود مستقیم نباشد");
    }

    // Simulate reputation check - less aggressive
    const randomRisk = Math.random();
    if (randomRisk > 0.95) {
      threats.push("دامنه دارای سابقه امنیتی بد است");
      riskLevel = "high";
    } else if (randomRisk > 0.85) {
      warnings.push("دامنه جدید یا کم‌شناخته است");
      riskLevel = riskLevel === "high" ? "high" : "medium";
    }

    // Check for file hosting services
    const fileHosting = [
      "drive.google.com",
      "dropbox.com",
      "onedrive.com",
      "mega.nz",
    ];
    if (fileHosting.some((service) => urlObj.hostname.includes(service))) {
      warnings.push(
        "سرویس میزبانی فایل - ممکن است نیاز به احراز هویت داشته باشد"
      );
    }
  } catch (error) {
    threats.push("خطا در بررسی امنیتی لینک");
    riskLevel = "high";
  }

  return {
    isSafe: threats.length === 0,
    threats,
    warnings,
    riskLevel,
    canProceed: true, // Always allow proceeding with user confirmation
  };
}

export async function detectFileInfo(url: string): Promise<FileInfo | null> {
  // Simulate file detection delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let filename = pathname.split("/").pop() || "unknown-file";
    let extension = "";
    let isWebContent = false;

    // Handle URLs without clear file extensions
    if (!filename.includes(".") || filename.length < 3) {
      // Check if it's a known content platform
      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        filename = "YouTube-Video.mp4";
        extension = "mp4";
        isWebContent = true;
      } else if (urlObj.hostname.includes("vimeo.com")) {
        filename = "Vimeo-Video.mp4";
        extension = "mp4";
        isWebContent = true;
      } else if (
        urlObj.hostname.includes("twitter.com") ||
        urlObj.hostname.includes("x.com")
      ) {
        filename = "Twitter-Content.html";
        extension = "html";
        isWebContent = true;
      } else {
        // Generic web content
        filename = `Web-Content-${Date.now()}.html`;
        extension = "html";
        isWebContent = true;
      }
    } else {
      extension = filename.split(".").pop()?.toLowerCase() || "";
    }

    // Simulate HEAD request to get file info
    const simulatedResponse = {
      "content-length": isWebContent
        ? Math.floor(Math.random() * 50 * 1024 * 1024).toString() // Web content: up to 50MB
        : Math.floor(Math.random() * MAX_FILE_SIZE).toString(),
      "content-type": getContentType(extension),
      "last-modified": new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    const fileSize = Number.parseInt(simulatedResponse["content-length"]);

    // Don't block based on file type anymore, just warn
    if (extension && !ALLOWED_EXTENSIONS.includes(extension) && !isWebContent) {
      console.warn(
        `File type ${extension} is not in allowed list, but proceeding with warning`
      );
    }

    return {
      name: filename,
      size: fileSize,
      type: simulatedResponse["content-type"],
      extension: extension,
      url: url,
      isSecure: urlObj.protocol === "https:",
      lastModified: simulatedResponse["last-modified"],
      isWebContent: isWebContent,
    };
  } catch (error) {
    console.error("File detection error:", error);
    // Don't return null, return a generic web content info
    try {
      const urlObj = new URL(url);
      return {
        name: `Web-Content-${urlObj.hostname}.html`,
        size: Math.floor(Math.random() * 10 * 1024 * 1024), // Random size up to 10MB
        type: "text/html",
        extension: "html",
        url: url,
        isSecure: urlObj.protocol === "https:",
        isWebContent: true,
      };
    } catch {
      return null;
    }
  }
}

export async function downloadFile(
  url: string,
  filename: string,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(progress);

        // Simulate actual download
        setTimeout(() => {
          try {
            // For web content, open in new tab
            if (
              filename.includes("Web-Content") ||
              filename.includes("YouTube") ||
              filename.includes("Vimeo")
            ) {
              window.open(url, "_blank");
            } else {
              // Create a temporary download link
              const link = document.createElement("a");
              link.href = url;
              link.download = filename;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 500);
      } else {
        onProgress(Math.min(progress, 100));
      }
    }, 200);

    // Reduce failure rate
    setTimeout(() => {
      if (Math.random() > 0.95) {
        // Only 5% chance of failure
        clearInterval(interval);
        reject(new Error("Download failed"));
      }
    }, 3000);
  });
}

function getContentType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    exe: "application/x-msdownload",
    apk: "application/vnd.android.package-archive",
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
