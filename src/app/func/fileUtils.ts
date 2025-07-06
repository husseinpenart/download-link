interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string;
  isSecure: boolean;
  lastModified?: string;
}

interface SecurityResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  riskLevel: "low" | "medium" | "high";
}

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mp3",
  "wav",
  "flac",
  "aac",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
];

// Blocked domains (example malicious domains)
const BLOCKED_DOMAINS = [
  "malware-site.com",
  "phishing-example.net",
  "suspicious-downloads.org",
];

// Maximum file size (5GB in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];

  // Basic URL format validation
  try {
    const urlObj = new URL(url);

    // Check protocol
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      errors.push("فقط پروتکل HTTP و HTTPS مجاز است");
    }

    // Check for blocked domains
    if (BLOCKED_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      errors.push("این دامنه در لیست سیاه قرار دارد");
    }

    // Check for suspicious patterns
    if (
      urlObj.hostname.includes("bit.ly") ||
      urlObj.hostname.includes("tinyurl")
    ) {
      errors.push("لینک‌های کوتاه شده مجاز نیستند");
    }

    // Check for IP addresses (potential security risk)
    if (/^\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname)) {
      errors.push("استفاده از آدرس IP به جای دامنه مجاز نیست");
    }
  } catch (error) {
    errors.push("فرمت لینک نامعتبر است");
  }

  return {
    isValid: errors.length === 0,
    errors,
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

    // Check HTTPS
    if (urlObj.protocol !== "https:") {
      warnings.push("اتصال امن (HTTPS) استفاده نمی‌شود");
      riskLevel = "medium";
    }

    // Simulate malware check
    const suspiciousPatterns = [
      "download-now",
      "free-crack",
      "keygen",
      "malware",
      "virus",
    ];

    if (
      suspiciousPatterns.some((pattern) => url.toLowerCase().includes(pattern))
    ) {
      threats.push("الگوی مشکوک در لینک شناسایی شد");
      riskLevel = "high";
    }

    // Check file extension in URL
    const pathExtension = urlObj.pathname.split(".").pop()?.toLowerCase();
    if (pathExtension && !ALLOWED_EXTENSIONS.includes(pathExtension)) {
      warnings.push(`فرمت فایل ${pathExtension} در لیست مجاز نیست`);
      riskLevel = riskLevel === "high" ? "high" : "medium";
    }

    // Simulate reputation check
    const randomRisk = Math.random();
    if (randomRisk > 0.9) {
      threats.push("دامنه دارای سابقه امنیتی مشکوک است");
      riskLevel = "high";
    } else if (randomRisk > 0.7) {
      warnings.push("دامنه جدید یا کم‌شناخته است");
      riskLevel = riskLevel === "high" ? "high" : "medium";
    }
  } catch (error) {
    threats.push("خطا در بررسی امنیتی لینک");
    riskLevel = "high";
  }

  return {
    isSafe: threats.length === 0 && riskLevel !== "high",
    threats,
    warnings,
    riskLevel,
  };
}

export async function detectFileInfo(url: string): Promise<FileInfo | null> {
  // Simulate file detection delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop() || "unknown-file";
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    // Simulate HEAD request to get file info
    // In real implementation, you would make an actual HTTP HEAD request
    const simulatedResponse = {
      "content-length": Math.floor(Math.random() * MAX_FILE_SIZE).toString(),
      "content-type": getContentType(extension),
      "last-modified": new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    const fileSize = parseInt(simulatedResponse["content-length"]);

    // Check file size
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error("File size exceeds maximum limit");
    }

    // Check if extension is allowed
    if (extension && !ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error("File type not allowed");
    }

    return {
      name: filename,
      size: fileSize,
      type: simulatedResponse["content-type"],
      extension: extension,
      url: url,
      isSecure: urlObj.protocol === "https:",
      lastModified: simulatedResponse["last-modified"],
    };
  } catch (error) {
    console.error("File detection error:", error);
    return null;
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
          // Create a temporary download link
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        }, 500);
      } else {
        onProgress(Math.min(progress, 100));
      }
    }, 200);

    // Simulate potential download failure
    setTimeout(() => {
      if (Math.random() > 0.9) {
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
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
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

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
