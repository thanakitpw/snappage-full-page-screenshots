import { Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="rounded-2xl border bg-white p-10 shadow-sm max-w-md w-full">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
          <Wrench className="h-8 w-8 text-[#F97316]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Under Maintenance</h1>
        <p className="mt-3 text-gray-500">
          We&apos;re improving SnapPage to serve you better.
          <br />
          Please check back soon!
        </p>
        <p className="mt-2 text-sm text-gray-400">
          กำลังปรับปรุงระบบ กรุณากลับมาใหม่เร็วๆ นี้
        </p>
        <div className="mt-6 text-xs text-gray-300">
          © 2026 SnapPage
        </div>
      </div>
    </div>
  );
}
