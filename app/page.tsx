"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapIcon, Upload, Camera, Globe, Compass, Settings } from "lucide-react"
import { TourData } from "@/types/tour-types"

export default function HomePage() {
  const [recentTours, setRecentTours] = useState<TourData[]>([])
  const [loading, setLoading] = useState(true)
  
  // ดึงข้อมูลทัวร์ล่าสุด
  useEffect(() => {
    // Add API call to fetch recent tours data
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIuNSIvPjxwYXRoIGQ9Ik0wIDMwaDMwdjMwSDB6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIuNSIvPjxwYXRoIGQ9Ik0wIDBoMzB2MzBIMHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9Ii41Ii8+PHBhdGggZD0iTTMwIDBoMzB2MzBIMzB6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIuNSIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-spin-slow">
                <Compass className="h-16 w-16 text-blue-300/50" />
              </div>
              <Camera className="h-16 w-16 text-white relative z-10" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
            Virtual Tour 360°
          </h1>
          
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
            Experience immersive panoramic views or create your own virtual tours with our cutting-edge 360° technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {/* Map Card */}
          <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 group-hover:opacity-90 transition-opacity"></div>
            
            <div className="relative h-72 overflow-hidden">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aerial-drone-panoramic-view-old-brasov-centre-romania.jpg-qabqKqeirSJMELHQ6fK0i2Vprikot8.jpeg" 
                alt="Virtual Tour Preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/30 backdrop-blur-sm rounded-lg">
                    <Globe className="h-6 w-6 text-blue-100" />
                  </div>
                  <h3 className="text-2xl font-bold">Explore Maps</h3>
                </div>
                
                <p className="text-blue-100/90 mb-4">
                  Navigate through stunning 360° panoramic views of various locations around the world
                </p>
                
                <Link href="/map">
                  <Button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white">
                    Start Exploring
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-700/90 group-hover:opacity-90 transition-opacity"></div>
            
            <div className="relative h-72 overflow-hidden bg-gradient-to-br from-indigo-800 to-purple-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-300/30 animate-spin-slow"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-dashed border-indigo-300/40 animate-spin-slow-reverse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="h-16 w-16 text-indigo-200/70" />
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/30 backdrop-blur-sm rounded-lg">
                    <Camera className="h-6 w-6 text-purple-100" />
                  </div>
                  <h3 className="text-2xl font-bold">Upload 360° Images</h3>
                </div>
                
                <p className="text-purple-100/90 mb-4">
                  Upload your own panoramic photos and create immersive virtual tour experiences
                </p>
                
                <Link href="/upload">
                  <Button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white">
                    Upload Images
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Manage Card */}
          <div className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-green-700/90 group-hover:opacity-90 transition-opacity"></div>
            
            <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-800 to-green-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-green-300/30 animate-pulse"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-dashed border-green-300/40 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Settings className="h-16 w-16 text-green-200/70" />
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/30 backdrop-blur-sm rounded-lg">
                    <Settings className="h-6 w-6 text-green-100" />
                  </div>
                  <h3 className="text-2xl font-bold">จัดการสถานที่</h3>
                </div>
                
                <p className="text-green-100/90 mb-4">
                  จัดการสถานที่และจุดสนใจต่างๆ เพิ่ม แก้ไข หรือลบข้อมูลในระบบ
                </p>
                
                <Link href="/manage">
                  <Button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white">
                    จัดการสถานที่
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-blue-200/60 text-sm">
            © 2025 Virtual Tour 360° | Experience the world in every direction
          </p>
        </div>
      </div>
    </div>
  )
}
