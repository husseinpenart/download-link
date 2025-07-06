"use client";

import {
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Eye,
  HardDrive,
  Globe,
  Youtube,
  ExternalLink,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatFileSize } from "../../func/fileUtils";

interface FileData {
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

interface FileInfoProps {
  fileData: FileData;
  onPreview: () => void;
  className?: string;
}

export function FileInfo({
  fileData,
  onPreview,
  className = "",
}: FileInfoProps) {
  const getFileIcon = (extension: string, isWebContent?: boolean) => {
    const iconClass = "w-8 h-8";

    if (isWebContent) {
      if (fileData.name.includes("YouTube")) {
        return <Youtube className={`${iconClass} text-red-400`} />;
      }
      if (fileData.name.includes("Instagram")) {
        return <ImageIcon className={`${iconClass} text-pink-400`} />;
      }
      if (fileData.name.includes("TikTok")) {
        return <Video className={`${iconClass} text-black`} />;
      }
      if (fileData.name.includes("Twitter")) {
        return <Video className={`${iconClass} text-blue-400`} />;
      }
      if (fileData.name.includes("Facebook")) {
        return <Video className={`${iconClass} text-blue-600`} />;
      }
      if (fileData.name.includes("Guide")) {
        return <FileText className={`${iconClass} text-amber-400`} />;
      }
      return <Globe className={`${iconClass} text-blue-400`} />;
    }

    switch (extension.toLowerCase()) {
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className={`${iconClass} text-blue-400`} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className={`${iconClass} text-green-400`} />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className={`${iconClass} text-red-400`} />;
      case "mp3":
      case "wav":
      case "flac":
        return <Music className={`${iconClass} text-purple-400`} />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className={`${iconClass} text-amber-400`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  const getContentTypeLabel = () => {
    if (fileData.name.includes("Guide")) {
      return "راهنمای دانلود";
    }
    if (fileData.isRealVideo) {
      if (fileData.name.includes("YouTube")) return "ویدیو یوتیوب - واقعی";
      if (fileData.name.includes("Instagram"))
        return "ویدیو اینستاگرام - واقعی";
      if (fileData.name.includes("TikTok")) return "ویدیو تیک‌تاک - واقعی";
      return "ویدیو واقعی";
    }
    if (fileData.isWebContent) {
      if (fileData.name.includes("YouTube")) return "ویدیو یوتیوب";
      if (fileData.name.includes("Instagram")) return "رسانه اینستاگرام";
      if (fileData.name.includes("TikTok")) return "ویدیو تیک‌تاک";
      if (fileData.name.includes("Twitter")) return "رسانه توییتر";
      if (fileData.name.includes("Facebook")) return "ویدیو فیس‌بوک";
      if (fileData.name.includes("Aparat")) return "ویدیو آپارات";
      return "محتوای وب";
    }
    return fileData.extension.toUpperCase();
  };

  const getDownloadNote = () => {
    if (fileData.name.includes("Guide")) {
      return "راهنمای کامل با روش‌های تضمینی - ۹۹٪ موفقیت!";
    }
    if (fileData.isRealVideo) {
      return "ویدیو واقعی شناسایی شد - دانلود مستقیم!";
    }
    if (fileData.name.includes("YouTube")) {
      return "یوتیوب: دانلود مستقیم با ytdl-core";
    }
    return "دانلود هوشمند - ویدیو واقعی یا راهنمای تضمینی";
  };

  const isGuideFile = fileData.name.includes("Guide");
  const isRealVideo = fileData.isRealVideo === true;

  return (
    <div
      className={`p-5 bg-gradient-to-r ${
        isRealVideo
          ? "from-green-500/10 to-emerald-500/10 border-green-500/30"
          : isGuideFile
          ? "from-amber-500/10 to-orange-500/10 border-amber-500/30"
          : "from-blue-500/10 to-purple-500/10 border-blue-500/30"
      } border rounded-2xl animate-in slide-in-from-top duration-300 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-16 h-16 ${
            isRealVideo
              ? "bg-green-500/20"
              : isGuideFile
              ? "bg-amber-500/20"
              : "bg-blue-500/20"
          } rounded-2xl flex items-center justify-center flex-shrink-0`}
        >
          {getFileIcon(fileData.extension, fileData.isWebContent)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`${
                  isRealVideo
                    ? "text-green-400"
                    : isGuideFile
                    ? "text-amber-400"
                    : "text-blue-400"
                } font-medium mb-1 truncate`}
              >
                {fileData.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(fileData.size)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 ${
                      isRealVideo
                        ? "bg-green-400"
                        : isGuideFile
                        ? "bg-amber-400"
                        : "bg-blue-400"
                    } rounded-full`}
                  ></span>
                  <span>{getContentTypeLabel()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onPreview}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200 flex-shrink-0"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  fileData.isSecure ? "bg-green-400" : "bg-yellow-400"
                }`}
              ></span>
              <span>
                {fileData.isSecure
                  ? "اتصال امن (HTTPS)"
                  : "اتصال غیرامن (HTTP)"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              {isRealVideo ? (
                <CheckCircle className="w-3 h-3 mt-0.5 text-green-400" />
              ) : isGuideFile ? (
                <ExternalLink className="w-3 h-3 mt-0.5 text-amber-400" />
              ) : (
                <AlertTriangle className="w-3 h-3 mt-0.5 text-blue-400" />
              )}
              <span
                className={`${
                  isRealVideo
                    ? "text-green-400"
                    : isGuideFile
                    ? "text-amber-400"
                    : "text-blue-400"
                } font-medium`}
              >
                {getDownloadNote()}
              </span>
            </div>
          </div>

          <div
            className={`mt-3 pt-3 border-t ${
              isRealVideo
                ? "border-green-500/20"
                : isGuideFile
                ? "border-amber-500/20"
                : "border-blue-500/20"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isRealVideo
                  ? "text-green-400"
                  : isGuideFile
                  ? "text-amber-400"
                  : "text-blue-400"
              } text-sm`}
            >
              {isRealVideo ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    ویدیو واقعی تأیید شد - دانلود مستقیم!
                  </span>
                </>
              ) : isGuideFile ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">
                    راهنمای تضمینی - روش‌های کاربردی و تست شده!
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    دانلود هوشمند - بررسی محتوا...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
