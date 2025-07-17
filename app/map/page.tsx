"use client"

import { StreetViewTour } from "@/components/street-view-tour"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { TourData } from "@/types/tour-types"

export default function MapPage() {
  const [isReady, setIsReady] = useState(false)
  const [tours, setTours] = useState<TourData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  
  // ดึงข้อมูล tours จาก API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/tours')
        
        if (!response.ok) {
          throw new Error('Failed to fetch tours')
        }
        
        const data = await response.json()
        setTours(data)
        
        // ถ้ามีข้อมูล tour ให้เลือก tour แรก
        if (data.length > 0) {
          setSelectedTourId(data[0].id)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching tours:', err)
        setError('Failed to load tours. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTours()
  }, [])
  
  // เลือก tour ที่ต้องการแสดง
  const selectedTour = tours.find(tour => tour.id === selectedTourId)
  
  // Ensure the component is fully mounted before rendering the 360° tour
  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  // แปลงข้อมูล tour ให้อยู่ในรูปแบบที่ StreetViewTour ต้องการ
  const mapTourToLocation = (tour: TourData) => {
    // แปลงข้อมูล infoPoints ให้ตรงกับ interface InfoPoint ใน StreetViewTour
    const mappedInfoPoints = (tour.infoPoints || []).map(point => ({
      id: point.id,
      yaw: point.yaw,
      pitch: point.pitch,
      distance: point.distance,
      title: point.title,
      description: point.description,
      details: point.details || '',
      icon: point.icon,
      type: point.type || 'info',
      linkTo: point.linkTo || ''
    }))
    
    return {
      id: tour.id,
      name: tour.title,
      description: tour.description || '',
      image: tour.imagePath,
      infoPoints: mappedInfoPoints
    }
  }
  
  // แปลงข้อมูล tours ทั้งหมดให้อยู่ในรูปแบบที่ StreetViewTour ต้องการ
  const allMappedLocations = tours.map(mapTourToLocation)
  
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
      
      {/* Tour selector */}
      {tours.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>เลือกสถานที่</span>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {tours.map(tour => (
                <Button 
                  key={tour.id}
                  variant={selectedTourId === tour.id ? "default" : "outline"}
                  className="w-full justify-start text-left text-sm py-1 px-2 h-auto"
                  onClick={() => setSelectedTourId(tour.id)}
                >
                  {tour.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {(loading || !isReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-white text-lg">กำลังโหลด Virtual Tour...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-xl max-w-md">
            <p className="text-white text-lg mb-4">{error}</p>
            <p className="text-white/80 text-sm mb-6">ไม่พบข้อมูล Virtual Tour กรุณาอัปโหลดข้อมูลก่อน</p>
            <Link href="/upload">
              <Button>ไปยังหน้าอัปโหลด</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* No tours message */}
      {!loading && !error && tours.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-xl max-w-md">
            <p className="text-white text-lg mb-4">ไม่พบข้อมูล Virtual Tour</p>
            <p className="text-white/80 text-sm mb-6">กรุณาอัปโหลดข้อมูลก่อน</p>
            <Link href="/upload">
              <Button>ไปยังหน้าอัปโหลด</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Only render the tour when ready and has data */}
      {isReady && !loading && !error && selectedTour && (
        <StreetViewTour 
          key={selectedTourId} 
          initialLocation={mapTourToLocation(selectedTour)}
          allLocations={allMappedLocations}
          onLocationChange={(locationId) => {
            // เมื่อมีการเปลี่ยน scene ใน StreetViewTour ให้อัปเดตค่า selectedTourId
            console.log(`Scene changed to: ${locationId}`)
            setSelectedTourId(locationId)
          }}
        />
      )}
    </main>
  )
}
