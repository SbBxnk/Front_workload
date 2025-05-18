import { Loader } from 'lucide-react';
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      <div className="flex justify-center items-center space-x-4">
        <Loader className="animate-spin text-primary h-12 w-12 font-semibold" />
        <p className="text-4xl font-regular text-primary">Loading...</p>
      </div>
    </div>
  );
}