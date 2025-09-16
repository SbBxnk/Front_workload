import { Loader } from 'lucide-react'
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-base-100">
      <div className="flex items-center justify-center space-x-4">
        <Loader className="h-12 w-12 animate-spin font-semibold text-primary" />
        <p className="font-regular text-4xl text-primary">Loading...</p>
      </div>
    </div>
  )
}
