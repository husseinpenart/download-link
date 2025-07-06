"use client"

import { AlertTriangle, XCircle, X } from "lucide-react"

interface SecurityResult {
  isSafe: boolean
  threats: string[]
  warnings: string[]
  riskLevel: "low" | "medium" | "high"
  canProceed: boolean
}

interface RiskConfirmationModalProps {
  securityResult: SecurityResult
  url: string
  onAccept: () => void
  onCancel: () => void
}

export function RiskConfirmationModal({ securityResult, url, onAccept, onCancel }: RiskConfirmationModalProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-400 border-red-500/30 bg-red-500/10"
      case "medium":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
      default:
        return "text-gray-400 border-gray-500/30 bg-gray-500/10"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">تأیید دانلود پرخطر</h2>
          <p className="text-gray-300 text-sm">این لینک دارای خطرات امنیتی است</p>
        </div>

        <div className={`p-4 rounded-xl border mb-6 ${getRiskColor(securityResult.riskLevel)}`}>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="font-medium">سطح خطر: {securityResult.riskLevel === "high" ? "بالا" : "متوسط"}</span>
          </div>

          {securityResult.threats.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-2">تهدیدات:</p>
              <ul className="text-sm space-y-1">
                {securityResult.threats.map((threat, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {securityResult.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">هشدارها:</p>
              <ul className="text-sm space-y-1">
                {securityResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 mb-2">لینک مورد نظر:</p>
          <p className="text-sm text-white break-all">{url}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors font-medium"
          >
            با خطر موافقم
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">با ادامه، مسئولیت دانلود بر عهده شماست</p>
      </div>
    </div>
  )
}
