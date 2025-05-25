import { useLoaderStore } from '@/store/loaderStore'

export default function Loader() {
  const { loading } = useLoaderStore()

  if (!loading) return null // Hide loader when not loading

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
    </div>
  )
}

