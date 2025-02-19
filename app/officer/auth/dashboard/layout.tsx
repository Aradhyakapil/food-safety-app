import type { Metadata } from "next"
import "react-big-calendar/lib/css/react-big-calendar.css"

export const metadata: Metadata = {
  title: "Officer Dashboard - Food Safety Platform",
  description: "Food Safety Officer Dashboard for managing restaurant inspections and reports",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}

