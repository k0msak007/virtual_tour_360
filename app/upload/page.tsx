"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  ImageIcon, 
  Loader2, 
  Upload, 
  Camera, 
  PanelTop, 
  Check, 
  RotateCcw, 
  X, 
  Sparkles,
  Info,
  Save
} from "lucide-react"
import { StreetViewTour } from "@/components/street-view-tour"
import { InfoPointDialog } from "@/components/info-point-dialog"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types based on the street-view-tour component
interface InfoPoint {
  id: string
  yaw: number
  pitch: number
  distance: number
  title: string
  description: string
  details: string
  icon: string
}

interface TourLocation {
  id: string
  name: string
  description: string
  image: string
  infoPoints: InfoPoint[]
}

// Available icons for info points
const availableIcons = ["building", "mountain", "store"]

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [locationName, setLocationName] = useState("")
  const [locationDescription, setLocationDescription] = useState("")
  const [tourLocation, setTourLocation] = useState<TourLocation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState({ yaw: 0, pitch: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tourContainerRef = useRef<HTMLDivElement>(null)

  // Function to generate info points with predefined positions
  const generateInfoPoints = (count: number): InfoPoint[] => {
    // Define predefined positions for info points
    const predefinedPositions = [
      { yaw: 0, pitch: 0 },      // กลาง
      { yaw: 90, pitch: 0 },     // ขวา
      { yaw: -90, pitch: 0 },    // ซ้าย
      { yaw: 0, pitch: 45 },     // บน
      { yaw: 0, pitch: -45 },    // ล่าง
      { yaw: 45, pitch: 30 },    // ขวาบน
      { yaw: -45, pitch: 30 },   // ซ้ายบน
      { yaw: 45, pitch: -30 },   // ขวาล่าง
      { yaw: -45, pitch: -30 },  // ซ้ายล่าง
      { yaw: 135, pitch: 0 },    // หลังขวา
      { yaw: -135, pitch: 0 },   // หลังซ้าย
      { yaw: 180, pitch: 0 },    // หลัง
    ]
    
    // Select positions based on the desired count
    return Array.from({ length: Math.min(count, predefinedPositions.length) }).map((_, index) => ({
      id: `info-${nanoid(6)}`,
      yaw: predefinedPositions[index].yaw,
      pitch: predefinedPositions[index].pitch,
      distance: 400,
      title: `จุดสนใจ ${index + 1}`,
      description: `คำอธิบายสั้นๆ สำหรับจุดสนใจ ${index + 1}`,
      details: `รายละเอียดเพิ่มเติมสำหรับจุดสนใจ ${index + 1}. คุณสามารถแก้ไขข้อมูลนี้ได้ภายหลัง`,
      icon: availableIcons[index % availableIcons.length],
    }))
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
      return
    }

    setIsUploading(true)

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file)
    
    // In a real app, you would upload the file to a server here
    // For this demo, we'll just use the local URL
    setTimeout(() => {
      setUploadedImage(imageUrl)
      setIsUploading(false)
      toast.success("อัปโหลดรูปภาพสำเร็จ")
      
      // Generate info points with predefined positions
      const infoPoints: InfoPoint[] = generateInfoPoints(3)
      
      // Set location name from file name
      const locationNameFromFile = file.name.split('.')[0] || "รูปภาพ 360°"
      setLocationName(locationNameFromFile)
      
      // Create a temporary tour location with info points for preview
      const previewLocation: TourLocation = {
        id: `preview-${nanoid(6)}`,
        name: locationNameFromFile,
        description: "คุณสามารถกรอกรายละเอียดเพิ่มเติมได้",
        image: imageUrl,
        infoPoints: infoPoints,
      }
      setTourLocation(previewLocation)
    }, 1500)
  }

  // Save the tour location with current info
  const saveTourLocation = () => {
    if (!uploadedImage || !locationName.trim() || !tourLocation) return

    // Create a new tour location with updated info
    const updatedLocation: TourLocation = {
      ...tourLocation,
      name: locationName,
      description: locationDescription,
    }

    // Set the tour location
    setTourLocation(updatedLocation)
    toast.success("บันทึกทัวร์เสมือนจริงสำเร็จ")
  }

  // Reset form
  const handleReset = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage("") // แก้ไขจาก null เป็น string ว่าง
    setLocationName("")
    setLocationDescription("")
    setTourLocation(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 px-4 rounded-full text-sm font-medium mb-4">ระบบอัปโหลดรูปภาพ 360°</div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">สร้างทัวร์เสมือนจริง</h1>
        <p className="text-muted-foreground max-w-2xl">อัปโหลดรูปภาพ 360° และสร้างทัวร์เสมือนจริงพร้อมจุดสนใจอัตโนมัติ เพื่อให้ผู้ชมสามารถสำรวจสถานที่ของคุณได้อย่างมีส่วนร่วม</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card className="shadow-xl border-t-4 border-t-blue-500 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-500 p-1.5 rounded-md">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <CardTitle>อัปโหลดรูปภาพ 360°</CardTitle>
            </div>
            <CardDescription>
              อัปโหลดรูปภาพ 360° แบบพาโนรามาเพื่อสร้างทัวร์เสมือนจริงพร้อมจุดสนใจอัตโนมัติ
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  อัปโหลด
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <PanelTop className="h-4 w-4" />
                  ตั้งค่า
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upload" className="mt-0">
              <CardContent className="pt-6 space-y-4">
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-blue-50 p-3 rounded-full">
                        <Upload className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">ลากไฟล์มาวางที่นี่</h3>
                        <p className="text-sm text-muted-foreground mt-1">หรือคลิกเพื่อเลือกไฟล์</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            กำลังอัปโหลด...
                          </>
                        ) : (
                          <>เลือกไฟล์</>  
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-6">
                      รองรับไฟล์ภาพ 360° แบบพาโนรามา (รูปแบบ equirectangular)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-700">อัปโหลดรูปภาพสำเร็จ</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-green-100"
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.click()
                        }}
                      >
                        <RotateCcw className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                    
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <CardContent className="pt-6 space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <span>ชื่อสถานที่</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="เช่น เมืองบราซอฟ โรมาเนีย"
                    disabled={isUploading || !uploadedImage}
                    className="border-slate-200"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    placeholder="อธิบายเกี่ยวกับสถานที่นี้"
                    disabled={isUploading || !uploadedImage}
                    className="min-h-[120px] border-slate-200"
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="infoPoints">จุดสนใจอัตโนมัติ</Label>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700">ระบบได้สร้างจุดสนใจให้อัตโนมัติ 3 จุดแล้ว</p>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <CardFooter className="flex justify-between bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-100 mt-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <X className="h-4 w-4" />
                รีเซ็ต
              </Button>
              <Button 
                onClick={saveTourLocation} 
                disabled={isUploading || !uploadedImage || !locationName.trim()}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="h-4 w-4" />
                บันทึกทัวร์
              </Button>
            </CardFooter>
          </Tabs>
        </Card>

        {/* Preview or Instructions */}
        <div className="h-full">
          {tourLocation ? (
            <Card className="shadow-xl border-t-4 border-t-indigo-500 rounded-xl overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-500 p-1.5 rounded-md">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tourLocation.name || "ตัวอย่างทัวร์เสมือนจริง"}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {tourLocation.description || "คุณสามารถสำรวจภาพ 360° ได้โดยการลากเมาส์หรือแตะหน้าจอ"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    ตัวอย่าง
                  </div>
                </div>
              </CardHeader>
              <div
                className="relative rounded-xl overflow-hidden h-full bg-slate-100 border-2 border-slate-200"
                ref={tourContainerRef}
              >
                <StreetViewTour 
                  key={tourLocation?.id} 
                  initialLocation={tourLocation} 
                  onInfoPointPlace={(position) => {
                    console.log('Info point position from raycasting:', position)
                    // บันทึกตำแหน่งที่คลิกจาก raycasting
                    setClickPosition(position)
                    setDialogOpen(true)
                  }}
                />
                
                {/* Info Point Dialog */}
                {tourLocation && (
                  <InfoPointDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    position={clickPosition}
                    onSave={(infoPoint) => {
                      if (tourLocation) {
                        // Add new info point to the tour location
                        const updatedInfoPoints = [...tourLocation.infoPoints, infoPoint];
                        const updatedLocation: TourLocation = {
                          ...tourLocation,
                          infoPoints: updatedInfoPoints
                        };
                        setTourLocation(updatedLocation);
                      }
                    }}
                  />
                )}
                
                {/* Instruction overlay */}
                {uploadedImage && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
                    <p>ดับเบิลคลิกที่ตำแหน่งใดๆ ในรูปภาพเพื่อเพิ่มจุดสนใจ</p>
                  </div>
                )}
                
                {/* Info point dialog ถูกย้ายไปด้านบนแล้ว */}
              </div>
            </Card>
          ) : (
            <Card className="h-full shadow-xl border-t-4 border-t-indigo-500 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-indigo-500 p-1.5 rounded-md">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>ตัวอย่างทัวร์เสมือนจริง</CardTitle>
                </div>
                <CardDescription>
                  อัปโหลดรูปภาพ 360° เพื่อดูตัวอย่างทัวร์เสมือนจริงที่นี่
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 h-[400px]">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <ImageIcon className="h-12 w-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">ยังไม่มีรูปภาพ 360°</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    อัปโหลดรูปภาพ 360° เพื่อดูตัวอย่างทัวร์เสมือนจริงที่นี่ ระบบจะแสดงตัวอย่างทันทีหลังจากอัปโหลด
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
                  >
                    <Upload className="h-4 w-4" />
                    อัปโหลดรูปภาพ 360°
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <Upload className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-blue-900 mb-1">อัปโหลดรูปภาพ</h3>
                    <p className="text-sm text-blue-700">
                      อัปโหลดรูปภาพ 360° แบบพาโนรามา
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <PanelTop className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="font-medium text-purple-900 mb-1">กรอกข้อมูล</h3>
                    <p className="text-sm text-purple-700">
                      ระบุชื่อสถานที่และคำอธิบาย
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <Sparkles className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-medium text-green-900 mb-1">สร้างทัวร์</h3>
                    <p className="text-sm text-green-700">
                      จุดสนใจถูกสร้างอัตโนมัติแล้ว
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
