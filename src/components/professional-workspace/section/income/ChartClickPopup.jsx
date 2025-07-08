'use client'

export default function ChartClickPopup({ selectedBarData, setSelectedBarData, hideEarnings }) {
  if (!selectedBarData) return null

  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••'
    return `$${amount.toFixed(2)}`
  }

  const getContextMessage = () => {
    const { type, value } = selectedBarData

    if (type === 'daily') {
      return value > 600 ? '🔥 Great day!' :
             value > 400 ? '👍 Good performance' :
             '💡 Room for improvement'
    }

    if (type === 'hourly') {
      return value > 300 ? '⭐ Peak hour' :
             value > 200 ? '📈 Good hour' :
             '🔍 Low activity'
    }

    if (type === 'weekly') {
      return value > 3500 ? '🎯 Excellent week!' :
             value > 3000 ? '✅ Solid week' :
             '📊 Building momentum'
    }

    return ''
  }

  return (
    <div className="absolute top-5 right-5 min-w-[200px] z-50 bg-gradient-to-br from-blue-500 to-blue-900 text-white p-4 rounded-md shadow-lg animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-white/70">
            {selectedBarData.type === 'daily' && 'Daily Earnings'}
            {selectedBarData.type === 'hourly' && 'Hourly Average'}
            {selectedBarData.type === 'weekly' && 'Weekly Total'}
          </div>
          <div className="text-sm font-semibold">{selectedBarData.label}</div>
          <div className="text-lg font-bold">{formatEarnings(selectedBarData.value)}</div>
        </div>
        <button
          onClick={() => setSelectedBarData(null)}
          className="text-white/60 hover:text-white transition text-sm"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 text-xs text-white/70">
        {getContextMessage()}
      </div>
    </div>
  )
}
