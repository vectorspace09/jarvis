import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Page Not Found</h2>
        <p className="mt-2">Could not find requested resource</p>
        <Link 
          href="/"
          className="mt-4 inline-block rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 