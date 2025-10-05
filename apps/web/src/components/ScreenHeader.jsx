import { clearUserSession } from '../lib/auth'
export default function ScreenHeader({ title, children }) {
  return (
    <header className="sticky top-0 z-10 mb-2 bg-[#00ADB5] p-4 border-b border-[#00ADB5] shadow-lg shadow-[#222831]-30/500/30">
      <div className="flex items-center justify-between">
        <a href="/" className="text-2xl text-white font-extrabold">Lazy Man</a>
        <div className="text-sm text-gray-500">{children}</div>
        <button
  className="text-xs text-[#EEEEEE] border border-[#EEEEEE] shadow-md shadow-white-500/30 px-3 py-1 rounded-xl active:scale-[.99]"
  onClick={() => { clearUserSession(); location.reload() }}
>
  Switch user
</button>
        </div>
    </header>
  )
}