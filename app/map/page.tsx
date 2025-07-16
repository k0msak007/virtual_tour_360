"use client"

import { StreetViewTour } from "@/components/street-view-tour"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function MapPage() {
  const [isReady, setIsReady] = useState(false)
  
  // Ensure the component is fully mounted before rendering the 360° tour
  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <main className="h-screen w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
      
      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-white text-lg">Loading 360° View...</p>
          </div>
        </div>
      )}
      
      {/* Only render the tour when ready */}
      {isReady && <StreetViewTour />}
    </main>
  )
}
