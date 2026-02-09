const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-300 h-64" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

export default SkeletonCard