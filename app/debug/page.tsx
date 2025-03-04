import { DebugConnection } from "@/components/debug-connection"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">API Connection Debugger</h1>
      <DebugConnection />
    </div>
  )
}

