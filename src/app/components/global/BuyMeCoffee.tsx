"use client"

import { useState } from "react"
import { Coffee, Copy, CheckCircle, X, Heart, CreditCard } from "lucide-react"

export function BuyMeCoffee() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sample card number - replace with your actual payment details
  const cardNumber = "6037-9977-1234-5678"
  const cardHolder = "علی احمدی"
  const bankName = "بانک ملی ایران"

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy card number:", error)
    }
  }

  return (
    <>
      {/* Buy Me Coffee Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-40 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-3 rounded-2xl shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-2 group animate-pulse hover:animate-none"
      >
        <Coffee className="w-5 h-5 group-hover:animate-bounce" />
        <span className="hidden sm:block font-medium">قهوه بخر برام</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/10 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-tr-3xl"></div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Coffee className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">از برنامه راضی هستید؟</h2>
                <p className="text-gray-300 text-sm">اگر این ابزار برایتان مفید بود، می‌تونید یه قهوه برام بخرید!</p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-gray-300 text-sm">پشتیبانی از توسعه‌دهنده</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Coffee className="w-5 h-5 text-amber-400" />
                    <span className="text-gray-300 text-sm">انگیزه برای ویژگی‌های جدید</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">نگهداری و بهبود سرویس</span>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/80 text-xs mb-1">{bankName}</p>
                      <p className="text-white font-bold text-lg tracking-wider">{cardNumber}</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/60 text-xs">نام دارنده کارت</p>
                      <p className="text-white font-medium">{cardHolder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">مبلغ پیشنهادی</p>
                      <p className="text-white font-bold">۵۰,۰۰۰ تومان</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyCard}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-xl hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-white" />
                    شماره کارت کپی شد!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    کپی شماره کارت
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs mb-2">💝 هر مبلغی که بفرستید قدردانی می‌شه</p>
                <p className="text-gray-500 text-xs">با تشکر از حمایت شما</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
