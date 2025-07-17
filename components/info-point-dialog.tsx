import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building, Mountain, Store, Info, ArrowRight } from "lucide-react"
import { InfoPointType, TourData } from "@/types/tour-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface InfoPointDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    details: string
    icon: string
    type: InfoPointType
    linkTo?: string
  }) => void
  onPreview?: (data: {
    title: string
    description: string
    details: string
    icon: string
    type: InfoPointType
    linkTo?: string
  }) => void
  initialData?: {
    id?: string
    yaw?: number
    pitch?: number
    distance?: number
    title?: string
    description?: string
    details?: string
    icon?: string
    type?: InfoPointType
    linkTo?: string
  }
  availableScenes?: {id: string, name: string}[] // รายการ scene ทั้งหมดที่มีอยู่
}

export function InfoPointDialog({
  isOpen,
  onClose,
  onSave,
  onPreview,
  initialData,
  availableScenes = [],
}: InfoPointDialogProps) {
  const [title, setTitle] = React.useState(initialData?.title || "")
  const [description, setDescription] = React.useState(initialData?.description || "")
  const [details, setDetails] = React.useState(initialData?.details || "")
  const [icon, setIcon] = React.useState(initialData?.icon || "building")
  const [pointType, setPointType] = React.useState<InfoPointType>(initialData?.type || "info")
  const [selectedSceneId, setSelectedSceneId] = React.useState<string>(initialData?.linkTo || "")  
  
  // เมื่อมีการเปลี่ยน scene ให้เลือก scene แรกโดยอัตโนมัติถ้ามี
  useEffect(() => {
    if (availableScenes.length > 0 && !selectedSceneId && pointType === 'scene') {
      setSelectedSceneId(availableScenes[0].id)
    }
  }, [availableScenes, selectedSceneId, pointType])
  
  // เมื่อมีการเปลี่ยนค่า initialData ให้อัปเดตค่าในฟอร์ม
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      setDetails(initialData.details || "")
      setIcon(initialData.icon || "building")
      setPointType(initialData.type || "info")
      setSelectedSceneId(initialData.linkTo || "")
    }
  }, [initialData])

  const handleSave = () => {
    if (!title.trim()) return
    
    onSave({
      title,
      description,
      details,
      icon,
      type: pointType,
      linkTo: pointType === 'scene' ? selectedSceneId : undefined,
    })
    
    // Reset form
    setTitle("")
    setDescription("")
    setDetails("")
    setIcon("building")
    setPointType("info")
    setSelectedSceneId("")
    
    // Close dialog
    onClose()
  }
  
  const handlePreview = () => {
    if (!title.trim()) return
    if (onPreview) {
      onPreview({
        title,
        description,
        details,
        icon,
        type: pointType,
        linkTo: pointType === 'scene' ? selectedSceneId : undefined,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'แก้ไขจุดสนใจ' : 'เพิ่มจุดสนใจ'}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลและเลือกประเภทของจุดสนใจ
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" value={pointType} onValueChange={(value) => setPointType(value as InfoPointType)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              แสดงรายละเอียด
            </TabsTrigger>
            <TabsTrigger value="scene" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              เปลี่ยน Scene
            </TabsTrigger>
          </TabsList>
        <TabsContent value="info" className="mt-0">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                ชื่อ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="เช่น พระราชวัง"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                คำอธิบายสั้น
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="เช่น พระราชวังที่สวยงาม"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">
                รายละเอียด
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="col-span-3"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับจุดสนใจนี้"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ไอคอน</Label>
              <RadioGroup
                value={icon}
                onValueChange={setIcon}
                className="col-span-3 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="building" id="building" />
                  <Label htmlFor="building" className="flex items-center gap-1 cursor-pointer">
                    <Building className="h-5 w-5" />
                    <span>อาคาร</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mountain" id="mountain" />
                  <Label htmlFor="mountain" className="flex items-center gap-1 cursor-pointer">
                    <Mountain className="h-5 w-5" />
                    <span>ภูเขา</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="store" id="store" />
                  <Label htmlFor="store" className="flex items-center gap-1 cursor-pointer">
                    <Store className="h-5 w-5" />
                    <span>ร้านค้า</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scene" className="mt-0">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                ชื่อ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="เช่น ไปยังสถานที่ถัดไป"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scene-select" className="text-right">
                เลือก Scene <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                {availableScenes.length > 0 ? (
                  <Select value={selectedSceneId} onValueChange={setSelectedSceneId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก Scene ที่ต้องการเปลี่ยนไป" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScenes.map((scene) => (
                        <SelectItem key={scene.id} value={scene.id}>
                          {scene.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    ไม่พบ Scene ที่สามารถเลือกได้ กรุณาสร้าง Scene อื่นก่อน
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                คำอธิบาย
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="เช่น คลิกเพื่อไปยังสถานที่ถัดไป"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ไอคอน</Label>
              <RadioGroup
                value={icon}
                onValueChange={setIcon}
                className="col-span-3 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="building" id="scene-building" />
                  <Label htmlFor="scene-building" className="flex items-center gap-1 cursor-pointer">
                    <Building className="h-5 w-5" />
                    <span>อาคาร</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mountain" id="scene-mountain" />
                  <Label htmlFor="scene-mountain" className="flex items-center gap-1 cursor-pointer">
                    <Mountain className="h-5 w-5" />
                    <span>ภูเขา</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="store" id="scene-store" />
                  <Label htmlFor="scene-store" className="flex items-center gap-1 cursor-pointer">
                    <Store className="h-5 w-5" />
                    <span>ร้านค้า</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
        </Tabs>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
          </div>
          <div className="flex gap-2">
            {onPreview && (
              <Button 
                variant="secondary" 
                onClick={handlePreview}
                disabled={!title.trim() || (pointType === 'scene' && !selectedSceneId)}
              >
                ดูตัวอย่าง
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || (pointType === 'scene' && !selectedSceneId)}
            >
              บันทึก
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
