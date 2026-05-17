"use client";
import { Suspense } from "react";
import PublishContent from "./content";

export default function PublishPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>}>
      <PublishContent />
    </Suspense>
  );
}
