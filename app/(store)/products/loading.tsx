export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-4/3 animate-pulse bg-gray-200" />
              <div className="p-5">
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                <div className="mt-5 h-7 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-5 flex gap-3">
                  <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-200" />
                  <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}