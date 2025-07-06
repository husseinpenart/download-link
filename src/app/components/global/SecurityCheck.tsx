import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface SecurityResult {
  isSafe: boolean;
  threats: string[];
  warnings: string[];
  riskLevel: "low" | "medium" | "high";
}

interface SecurityCheckProps {
  result: SecurityResult;
  className?: string;
}

export function SecurityCheck({ result, className = "" }: SecurityCheckProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-400 border-green-500/30 bg-green-500/10";
      case "medium":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "high":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      default:
        return "text-gray-400 border-gray-500/30 bg-gray-500/10";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "medium":
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case "high":
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case "low":
        return "امن";
      case "medium":
        return "متوسط";
      case "high":
        return "خطرناک";
      default:
        return "نامشخص";
    }
  };

  return (
    <div
      className={`p-5 border rounded-2xl animate-in slide-in-from-top duration-300 ${getRiskColor(
        result.riskLevel
      )} ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{getRiskIcon(result.riskLevel)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium">بررسی امنیتی</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(
                result.riskLevel
              )}`}
            >
              سطح خطر: {getRiskText(result.riskLevel)}
            </span>
          </div>

          {result.threats.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-1 text-red-400">
                تهدیدات شناسایی شده:
              </p>
              <ul className="text-sm space-y-1">
                {result.threats.map((threat, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1 text-yellow-400">
                هشدارها:
              </p>
              <ul className="text-sm space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.isSafe &&
            result.threats.length === 0 &&
            result.warnings.length === 0 && (
              <p className="text-sm text-green-400">
                فایل امن است و آماده دانلود می‌باشد
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
