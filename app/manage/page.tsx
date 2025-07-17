"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StreetViewTour } from "@/components/street-view-tour"
import { InfoPointDialog } from "@/components/info-point-dialog"
import { TourData } from "@/types/tour-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Plus, Trash2, Edit, Save, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ManagePage() {
  const [tours, setTours] = useState<TourData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(true)
  const [editingInfoPointId, setEditingInfoPointId] = useState<string | null>(null)
  const [showInfoPointDialog, setShowInfoPointDialog] = useState(false)
  const [infoPointPosition, setInfoPointPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  const [previewInfoPoint, setPreviewInfoPoint] = useState<any | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tourToDelete, setTourToDelete] = useState<string | null>(null)
  
  // สถานะสำหรับการแก้ไขข้อมูลทัวร์
  const [editingTour, setEditingTour] = useState<TourData | null>(null)
  
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
  
  // เริ่มโหมดแก้ไขทันทีเมื่อเลือก tour
  useEffect(() => {
    if (selectedTour && isEditing) {
      setEditingTour({...selectedTour})
    }
  }, [selectedTourId, selectedTour, isEditing])
  
  // เริ่มการแก้ไข tour
  const startEditing = () => {
    if (selectedTour) {
      setEditingTour({...selectedTour})
      setIsEditing(true)
    }
  }
  
  // ยกเลิกการแก้ไข
  const cancelEditing = () => {
    setEditingTour(null)
    setIsEditing(false)
    setEditingInfoPointId(null)
  }
  
  // บันทึกการแก้ไข tour
  const saveTourChanges = async () => {
    if (!editingTour) return
    
    try {
      // แสดง toast ว่ากำลังบันทึก
      toast.loading('กำลังบันทึกการเปลี่ยนแปลง...')
      
      const response = await fetch(`/api/tours/${editingTour.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTour),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update tour')
      }
      
      // อัปเดตข้อมูล tours ในสถานะ
      setTours(tours.map(tour => 
        tour.id === editingTour.id ? editingTour : tour
      ))
      
      // แสดง toast สำเร็จและทำให้มองเห็นชัดเจน
      toast.dismiss() // ยกเลิก toast กำลังโหลด
      toast.success('บันทึกการเปลี่ยนแปลงเรียบร้อย', {
        duration: 3000, // แสดงนานขึ้น
        position: 'top-center' // แสดงตรงกลางด้านบน
      })
      
      // อัปเดตสถานะ
      // ไม่ต้องอัปเดต selectedTourId เพราะไม่ได้เปลี่ยน ID
      setIsEditing(true)
      setEditingTour(null)
    } catch (err) {
      console.error('Error updating tour:', err)
      toast.dismiss() // ยกเลิก toast กำลังโหลด
      toast.error('ไม่สามารถบันทึกการเปลี่ยนแปลงได้', {
        duration: 3000,
        position: 'top-center'
      })
    }
  }
  
  // เปิด dialog ยืนยันการลบ
  const handleDeleteTour = (tourId: string) => {
    setTourToDelete(tourId)
    setShowDeleteDialog(true)
  }
  
  // ดำเนินการลบ tour
  const confirmDeleteTour = async () => {
    if (!tourToDelete) return
    
    try {
      const response = await fetch(`/api/tours/${tourToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete tour')
      }
      
      // อัปเดตข้อมูล tours ในสถานะ
      setTours(tours.filter(tour => tour.id !== tourToDelete))
      
      // ถ้ากำลังลบ tour ที่กำลังเลือกหรือแก้ไขอยู่
      if (selectedTourId === tourToDelete) {
        setSelectedTourId(null)
        setEditingTour(null)
      }
      
      toast.success('Scene ถูกลบเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Error deleting tour:', err)
      toast.error('ไม่สามารถลบ scene ได้')
    } finally {
      // ปิด dialog และล้างข้อมูล
      setShowDeleteDialog(false)
      setTourToDelete(null)
    }
  }
  
  // อัปเดตข้อมูล tour ที่กำลังแก้ไข
  const updateEditingTour = (field: keyof TourData, value: any) => {
    if (!editingTour) return
    setEditingTour({
      ...editingTour,
      [field]: value
    })
  }
  
  // เพิ่มจุดสนใจใหม่
  const handleAddInfoPoint = (position: { yaw: number; pitch: number }) => {
    setInfoPointPosition(position)
    setEditingInfoPointId(null) // ล้างค่า editingInfoPointId เพื่อให้รู้ว่าเป็นการเพิ่มใหม่
    setShowInfoPointDialog(true)
  }
  
  // แก้ไขจุดสนใจ
  const handleEditInfoPoint = (infoPointId: string) => {
    if (!editingTour) return
    
    const infoPoint = editingTour.infoPoints.find(point => point.id === infoPointId)
    if (infoPoint) {
      setEditingInfoPointId(infoPointId)
      setInfoPointPosition({ yaw: infoPoint.yaw, pitch: infoPoint.pitch })
      setShowInfoPointDialog(true)
    }
  }
  
  // ลบจุดสนใจ
  const handleDeleteInfoPoint = (infoPointId: string) => {
    if (!editingTour) return
    
    const updatedInfoPoints = editingTour.infoPoints.filter(point => point.id !== infoPointId)
    setEditingTour({
      ...editingTour,
      infoPoints: updatedInfoPoints
    })
    
    toast.success('ลบจุดสนใจเรียบร้อย')
  }
  
  // แสดงตัวอย่างจุดสนใจก่อนบันทึก
  const handlePreviewInfoPoint = (infoPoint: any) => {
    if (!infoPointPosition) return
    
    // สร้างข้อมูลจุดสนใจสำหรับแสดงตัวอย่าง
    const previewPoint = {
      ...infoPoint,
      id: editingInfoPointId || `preview-${Math.random().toString(36).substr(2, 8)}`,
      yaw: infoPointPosition.yaw,
      pitch: infoPointPosition.pitch,
      distance: 400
    }
    
    // เก็บข้อมูลจุดสนใจที่แสดงตัวอย่าง
    setPreviewInfoPoint(previewPoint)
    
    // ซ่อน dialog ชั่วคราวเพื่อให้เห็นตัวอย่างจุดสนใจชัดเจน
    setShowInfoPointDialog(false)
    
    // แสดง dialog อีกครั้งหลังจากผ่านไป 3 วินาที
    setTimeout(() => {
      setShowInfoPointDialog(true)
    }, 3000)
  }
  
  // บันทึกข้อมูลจุดสนใจ
  const handleSaveInfoPoint = (infoPoint: any) => {
    if (!editingTour) return
    
    // เคลียร์ข้อมูลตัวอย่าง
    setPreviewInfoPoint(null)
    
    let updatedInfoPoints
    
    if (editingInfoPointId) {
      // แก้ไขจุดสนใจที่มีอยู่แล้ว
      updatedInfoPoints = editingTour.infoPoints.map(point => {
        if (point.id === editingInfoPointId) {
          // เก็บค่าตำแหน่งเดิมไว้ (yaw, pitch, distance)
          return { 
            ...point,  // เก็บค่าตำแหน่งเดิม
            ...infoPoint,  // อัพเดตข้อมูลใหม่
            id: editingInfoPointId  // คง id เดิมไว้
          }
        }
        return point
      })
    } else {
      // เพิ่มจุดสนใจใหม่
      updatedInfoPoints = [
        ...editingTour.infoPoints,
        {
          ...infoPoint,
          id: `info-${Math.random().toString(36).substr(2, 8)}`,
          yaw: infoPointPosition?.yaw || 0,
          pitch: infoPointPosition?.pitch || 0,
          distance: 400 // ค่าเริ่มต้น
        }
      ]
    }
    
    setEditingTour({
      ...editingTour,
      infoPoints: updatedInfoPoints
    })
    
    setShowInfoPointDialog(false)
    setEditingInfoPointId(null)
    setInfoPointPosition(null)
  }
  
  // แปลงข้อมูล tour ให้อยู่ในรูปแบบที่ StreetViewTour ต้องการ
  const mapTourToLocation = (tour: TourData) => {
    // ใช้ข้อมูลจาก editingTour ถ้ากำลังแก้ไขอยู่และเป็น tour เดียวกัน
    const sourceData = (editingTour && tour.id === editingTour.id) ? editingTour : tour
    
    // แปลงข้อมูล infoPoints ให้ตรงกับ interface InfoPoint ใน StreetViewTour
    let mappedInfoPoints = (sourceData.infoPoints || []).map(point => ({
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
    
    // ถ้ามีข้อมูลตัวอย่างจุดสนใจ ให้เพิ่มเข้าไปในรายการ
    if (previewInfoPoint) {
      // ถ้ากำลังแก้ไขจุดสนใจที่มีอยู่แล้ว ให้แทนที่จุดเดิม
      if (editingInfoPointId) {
        mappedInfoPoints = mappedInfoPoints.map(point => 
          point.id === editingInfoPointId ? previewInfoPoint : point
        )
      } else {
        // ถ้าเป็นจุดใหม่ ให้เพิ่มเข้าไปในรายการ
        mappedInfoPoints = [...mappedInfoPoints, previewInfoPoint]
      }
    }
    
    return {
      id: tour.id,
      name: sourceData.title,
      description: sourceData.description || '',
      image: sourceData.imagePath,
      infoPoints: mappedInfoPoints
    }
  }
  
  // แปลงข้อมูล tours ทั้งหมดให้อยู่ในรูปแบบที่ StreetViewTour ต้องการ
  const allMappedLocations = tours.map(mapTourToLocation)
  
  // หาจุดสนใจที่กำลังแก้ไข
  const editingInfoPoint = editingTour && editingInfoPointId 
    ? editingTour.infoPoints.find(point => point.id === editingInfoPointId)
    : null
  
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span>กลับหน้าหลัก</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">จัดการสถานที่ Virtual Tour</h1>
        </div>
        
        {selectedTour && editingTour && (
          <div className="flex items-center gap-2">
            <Button onClick={saveTourChanges} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </Button>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-lg">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 mt-2">กรุณาลองใหม่อีกครั้ง หรือตรวจสอบว่ามีข้อมูล Virtual Tour ในระบบหรือไม่</p>
          <Link href="/upload">
            <Button className="mt-4">ไปยังหน้าอัปโหลด</Button>
          </Link>
        </div>
      )}
      
      {!loading && !error && tours.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">ไม่พบข้อมูล Virtual Tour</p>
          <p className="text-yellow-600 mt-2">กรุณาอัปโหลดข้อมูลก่อน</p>
          <Link href="/upload">
            <Button className="mt-4">ไปยังหน้าอัปโหลด</Button>
          </Link>
        </div>
      )}
      
      {!loading && !error && tours.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* รายการสถานที่ */}
          <div className="bg-white rounded-lg shadow-md p-4 h-min">
            <h2 className="text-lg font-semibold mb-4">รายการสถานที่</h2>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {tours.map(tour => (
                <div key={tour.id} className="flex items-center gap-2">
                  <Button 
                    variant={selectedTourId === tour.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => {
                      setSelectedTourId(tour.id)
                      // เริ่มโหมดแก้ไขทันทีเมื่อเลือก tour
                      if (isEditing) {
                        setEditingTour({...tour})
                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{tour.title}</div>
                      {tour.location && (
                        <div className="text-xs text-muted-foreground mt-1">{tour.location}</div>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTour(tour.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* แสดงและแก้ไขข้อมูล */}
          <div className="lg:col-span-2">
            {selectedTour && (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">แสดงตัวอย่าง</TabsTrigger>
                  <TabsTrigger value="info">ข้อมูลทั่วไป</TabsTrigger>
                  <TabsTrigger value="points">จุดสนใจ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="mt-0">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-200px)]">
                    {/* StreetViewTour component */}
                    <StreetViewTour 
                      key={editingTour?.id || selectedTourId}
                      initialLocation={mapTourToLocation(editingTour || selectedTour)}
                      allLocations={allMappedLocations}
                      onInfoPointPlace={handleAddInfoPoint}
                      onInfoPointClick={handleEditInfoPoint}
                    />
                    
                    <div className="absolute bottom-4 right-4 z-10">
                      <Button 
                        onClick={() => setShowInfoPointDialog(true)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4" />
                        <span>เพิ่มจุดสนใจ</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {editingTour && (
                  <TabsContent value="info" className="mt-0">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">ชื่อสถานที่</Label>
                            <Input 
                              id="title" 
                              value={editingTour.title} 
                              onChange={(e) => updateEditingTour('title', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="location">ตำแหน่งที่ตั้ง</Label>
                            <Input 
                              id="location" 
                              value={editingTour.location || ''} 
                              onChange={(e) => updateEditingTour('location', e.target.value)}
                              placeholder="เช่น กรุงเทพมหานคร, ประเทศไทย"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <Textarea 
                              id="description" 
                              value={editingTour.description || ''} 
                              onChange={(e) => updateEditingTour('description', e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
                
                {editingTour && (
                  <TabsContent value="points" className="mt-0">
                    <Card>
                      <CardContent className="pt-6">
                        {editingTour.infoPoints.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>ยังไม่มีจุดสนใจ</p>
                            <p className="text-sm mt-2">คลิกที่ภาพพาโนรามาเพื่อเพิ่มจุดสนใจ</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                            {editingTour.infoPoints.map(point => (
                              <div key={point.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div>
                                  <div className="font-medium">{point.title}</div>
                                  <div className="text-sm text-muted-foreground mt-1">{point.description}</div>
                                  <div className="text-xs mt-2">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      {point.type === 'scene' ? 'เปลี่ยน Scene' : 'ข้อมูล'}
                                    </span>
                                    {point.type === 'scene' && point.linkTo && (
                                      <span className="ml-2 text-gray-500">
                                        เชื่อมต่อไปยัง: {
                                          tours.find(t => t.id === point.linkTo)?.title || point.linkTo
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditInfoPoint(point.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteInfoPoint(point.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>
        </div>
      )}
      
      {/* Info Point Dialog */}
      {showInfoPointDialog && (
        <InfoPointDialog
          isOpen={showInfoPointDialog}
          onClose={() => {
            setShowInfoPointDialog(false)
            setEditingInfoPointId(null)
            setPreviewInfoPoint(null)
          }}
          onSave={handleSaveInfoPoint}
          onPreview={handlePreviewInfoPoint}
          initialData={editingInfoPointId ? editingTour?.infoPoints.find(point => point.id === editingInfoPointId) : undefined}
          availableScenes={tours.map(tour => ({
            id: tour.id,
            name: tour.title
          }))}
        />
      )}
      
      {/* Delete Tour Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>ยืนยันการลบ Scene</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              คุณแน่ใจหรือไม่ว่าต้องการลบ Scene นี้? การดำเนินการนี้ไม่สามารถยกเลิกได้และข้อมูลทั้งหมดจะถูกลบถาวร
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setTourToDelete(null)
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteTour}
            >
              ยืนยันการลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
