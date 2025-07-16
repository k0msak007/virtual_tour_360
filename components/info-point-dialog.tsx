import React from "react"
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
import { Building, Mountain, Store } from "lucide-react"

interface InfoPointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position: { yaw: number; pitch: number }
  onSave: (data: {
    id: string
    yaw: number
    pitch: number
    distance: number
    title: string
    description: string
    details: string
    icon: string
  }) => void
}

export function InfoPointDialog({
  open,
  onOpenChange,
  position,
  onSave,
}: InfoPointDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [icon, setIcon] = React.useState("building")

  const handleSave = () => {
    if (!title.trim()) return
    
    onSave({
      id: `info-${Date.now().toString(36)}`,
      yaw: position.yaw,
      pitch: position.pitch,
      distance: 400, // ค่าเริ่มต้นสำหรับระยะห่าง
      title,
      description,
      details,
      icon,
    })
    
    // Reset form
    setTitle("")
    setDescription("")
    setDetails("")
    setIcon("building")
    
    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มจุดสนใจ</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลและเลือกไอคอนสำหรับจุดสนใจใหม่
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
