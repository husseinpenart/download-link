import { Download, Pause, X } from "lucide-react";

interface DownloadProgressProps {
  progress: number;
  fileName: string;
  className?: string;
}

export function DownloadProgress({
  progress,
  fileName,
  className = "",
}: DownloadProgressProps) {
  const formatSpeed = (progress: number) => {
    // Simulate varying download speeds
    const baseSpeed = 2.5 + Math.random() * 2;
    const currentSpeed = baseSpeed * (progress / 100);
    return currentSpeed.toFixed(1);
  };

  const calculateTimeRemaining = (progress: number) => {
    if (progress >= 100) return "تکمیل شد";

    const remainingPercent = 100 - progress;
    const estimatedSeconds = (remainingPercent / progress) * 10;

    if (estimatedSeconds < 60) {
      return `${Math.ceil(estimatedSeconds)} ثانیه`;
    } else {
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = Math.ceil(estimatedSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  return (
    <div
      className={`p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl animate-in slide-in-from-bottom duration-300 ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-purple-400 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-purple-400 font-medium mb-1">در حال دانلود</p>
          <p className="text-gray-300 text-sm truncate">{fileName}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Pause className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>{Math.round(progress)}% تکمیل شده</span>
          <span>{formatSpeed(progress)} MB/s</span>
        </div>
        <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>زمان باقیمانده: {calculateTimeRemaining(progress)}</span>
        <span>اولویت: بالا</span>
      </div>
    </div>
  );
}
