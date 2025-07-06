"use client";

import {
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Eye,
  Calendar,
  HardDrive,
  Globe,
  Youtube,
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
      case "html":
      case "htm":
        return <Globe className={`${iconClass} text-blue-400`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "نامشخص";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getContentTypeLabel = () => {
    if (fileData.isWebContent) {
      if (fileData.name.includes("YouTube")) return "ویدیو یوتیوب";
      if (fileData.name.includes("Vimeo")) return "ویدیو ویمیو";
      if (fileData.name.includes("Twitter")) return "محتوای توییتر";
      return "محتوای وب";
    }
    return fileData.extension.toUpperCase();
  };

  return (
    <div
      className={`p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl animate-in slide-in-from-top duration-300 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          {getFileIcon(fileData.extension, fileData.isWebContent)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-green-400 font-medium mb-1 truncate">
                {fileData.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(fileData.size)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
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
            {!fileData.isWebContent && fileData.lastModified && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>آخرین تغییر: {formatDate(fileData.lastModified)}</span>
              </div>
            )}
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
            {fileData.isWebContent && (
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>
                  محتوای آنلاین - ممکن است نیاز به ابزار خاص داشته باشد
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                {fileData.isWebContent
                  ? "محتوا شناسایی شده و آماده دسترسی"
                  : "فایل تأیید شده و آماده دانلود"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
