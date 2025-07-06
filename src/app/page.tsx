"use client";

import type React from "react";

import { useState, useCallback } from "react";
import Inputs from "./components/global/Inputs";
import {
  validateUrl,
  detectFileInfo,
  checkUrlSecurity,
  downloadFile,
} from "./func/fileUtils";
import { SecurityCheck } from "./components/global/SecurityCheck";
import { FileInfo } from "./components/global/FileInfo";
import { DownloadProgress } from "./components/global/DownloadProgress";
import { RiskConfirmationModal } from "./components/global/RiskConfirmationModal";
import { BuyMeCoffee } from "./components/global/BuyMeCoffee";
import {
  Download,
  Link,
  Copy,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  Share2,
  Eye,
  AlertTriangle,
  FileDown,
  Star,
  ExternalLink,
  Youtube,
  FileVideo,
} from "lucide-react";

interface FileData {
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string;
  isSecure: boolean;
  lastModified?: string;
  isWebContent?: boolean;
  downloadUrl?: string;
  isRealVideo?: boolean;
}

interface SecurityResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  riskLevel: "low" | "medium" | "high";
  canProceed: boolean;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [securityResult, setSecurityResult] = useState<SecurityResult | null>(
    null
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadAttempts, setDownloadAttempts] = useState(0);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [userAcceptedRisk, setUserAcceptedRisk] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const validateAndDetectFile = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setErrors(["لطفاً لینک فایل را وارد نمائید"]);
      return;
    }

    setIsValidating(true);
    setErrors([]);
    setWarnings([]);
    setFileData(null);
    setSecurityResult(null);
    setUserAcceptedRisk(false);
    setDownloadSuccess(false);

    try {
      // Step 1: URL Validation
      const urlValidation = validateUrl(inputUrl);
      if (!urlValidation.isValid) {
        setErrors(urlValidation.errors);
        setWarnings(urlValidation.warnings);
        return;
      }

      // Set warnings from validation
      if (urlValidation.warnings.length > 0) {
        setWarnings(urlValidation.warnings);
      }

      // Step 2: Security Check
      const securityCheck = await checkUrlSecurity(inputUrl);
      setSecurityResult(securityCheck);

      // Step 3: File Detection
      const fileInfo = await detectFileInfo(inputUrl);
      if (fileInfo) {
        setFileData(fileInfo);
      } else {
        setWarnings((prev) => [
          ...prev,
          "نتوانستیم اطلاعات فایل را شناسایی کنیم",
        ]);
      }
    } catch (error) {
      setErrors(["خطا در پردازش لینک - لطفاً لینک را بررسی کنید"]);
      console.error("File detection error:", error);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Real-time validation for basic URL format
    if (newUrl && !newUrl.match(/^https?:\/\/.+/)) {
      setWarnings(["لینک باید با http:// یا https:// شروع شود"]);
    } else {
      setWarnings([]);
    }
  };

  const handleValidateUrl = () => {
    validateAndDetectFile(url);
  };

  const handleDownload = async () => {
    // Check if user needs to confirm risks
    if (
      securityResult &&
      (securityResult.riskLevel === "high" ||
        securityResult.threats.length > 0) &&
      !userAcceptedRisk
    ) {
      setShowRiskModal(true);
      return;
    }

    if (downloadAttempts >= 3) {
      setErrors(["حداکثر تعداد تلاش برای دانلود به پایان رسیده است"]);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadAttempts((prev) => prev + 1);
    setErrors([]);

    try {
      const downloadUrl = url;
      const fileName = fileData?.name || `download-${Date.now()}`;

      await downloadFile(downloadUrl, fileName, (progress) => {
        setDownloadProgress(progress);
      });

      setDownloadProgress(100);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error: any) {
      setErrors([
        error.message || "خطا در دانلود فایل. لطفاً مجدداً تلاش کنید",
      ]);
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  const handleRiskAccepted = () => {
    setUserAcceptedRisk(true);
    setShowRiskModal(false);
    handleDownload();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setErrors(["خطا در کپی کردن لینک"]);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "دانلود فایل",
          text: "این لینک را با دوستان خود به اشتراک بگذارید",
          url: url,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        setErrors(["خطا در اشتراک‌گذاری لینک"]);
      }
    }
  };

  const canDownload =
    url.trim() &&
    (fileData ||
      userAcceptedRisk ||
      (securityResult && securityResult.canProceed));

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundColor: "#130f40",
        backgroundImage: "linear-gradient(315deg, #130f40 0%, #000000 74%)",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Buy Me Coffee Button */}
      <BuyMeCoffee />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-purple-600 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25 animate-pulse">
              <FileDown className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-relaxed">
            دانلودر{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              مستقیم
            </span>{" "}
            فایل
          </h1>
          <p className="text-gray-300 text-base mb-8">
            دانلود مستقیم فایل‌ها - فقط یوتیوب و لینک‌های مستقیم
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300">
              <Youtube className="w-3 h-3 text-red-400" />
              یوتیوب مستقیم
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300">
              <FileVideo className="w-3 h-3 text-green-400" />
              لینک مستقیم فایل
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300">
              <Shield className="w-3 h-3 text-blue-400" />
              بدون راهنمای متنی
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-3xl"></div>

          <div className="relative z-10">
            {/* Input Section */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-4 text-right flex items-center justify-end gap-2">
                <span>لینک یوتیوب یا لینک مستقیم فایل</span>
                <Link className="w-4 h-4 text-purple-400" />
              </label>
              <div className="relative group">
                <Inputs
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://youtube.com/watch?v=... یا لینک مستقیم فایل"
                  className={`w-full h-14 rounded-2xl p-4 pr-14 border-2 ${
                    errors.length > 0
                      ? "border-red-500/50 focus:border-red-500"
                      : warnings.length > 0
                      ? "border-yellow-500/50 focus:border-yellow-500"
                      : "border-white/20 focus:border-purple-400"
                  } bg-white/5 text-white placeholder-gray-400 focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 group-hover:border-white/30`}
                />
                <Upload className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Validate Button */}
              <button
                onClick={handleValidateUrl}
                disabled={!url.trim() || isValidating}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    بررسی و آماده‌سازی دانلود
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {downloadSuccess && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-medium">
                      دانلود شروع شد!
                    </p>
                    <p className="text-gray-300 text-sm">
                      فایل در حال دانلود است یا در پوشه دانلود شما ذخیره شده
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium mb-2">
                      خطاهای شناسایی شده:
                    </p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Messages */}
            {warnings.length > 0 && errors.length === 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-yellow-400 font-medium mb-2">هشدارها:</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Security Check Results */}
            {securityResult && (
              <SecurityCheck result={securityResult} className="mb-6" />
            )}

            {/* File Information */}
            {fileData && (
              <FileInfo
                fileData={fileData}
                onPreview={() => setShowPreview(true)}
                className="mb-6"
              />
            )}

            {/* Download Progress */}
            {isDownloading && (
              <DownloadProgress
                progress={downloadProgress}
                fileName={fileData?.name || "محتوا"}
                className="mb-6"
              />
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={!canDownload || isDownloading}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden cursor-pointer disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    در حال دانلود...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:animate-bounce" />
                    دانلود مستقیم فایل
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  disabled={!url.trim()}
                  className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-medium py-3 px-4 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      کپی لینک
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  disabled={!url.trim()}
                  className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-medium py-3 px-4 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
                >
                  {shareSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">اشتراک شد</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      اشتراک
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Download Attempts Warning */}
            {downloadAttempts > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تعداد تلاش: {downloadAttempts}/3</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>دانلود مستقیم فایل - فقط یوتیوب و لینک‌های مستقیم</span>
          </div>
          <p className="text-gray-500 text-xs">
            بدون راهنمای متنی - فقط فایل‌های واقعی
          </p>
        </div>
      </div>

      {/* Risk Confirmation Modal */}
      {showRiskModal && securityResult && (
        <RiskConfirmationModal
          securityResult={securityResult}
          url={url}
          onAccept={handleRiskAccepted}
          onCancel={() => setShowRiskModal(false)}
        />
      )}
    </div>
  );
}
