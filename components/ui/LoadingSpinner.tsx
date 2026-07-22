export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600
        rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}