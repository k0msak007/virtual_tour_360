export type InfoPointType = 'info' | 'scene';

export interface InfoPoint {
  id: string;
  yaw: number;
  pitch: number;
  distance: number;
  title: string;
  description: string;
  details?: string;
  icon: string;
  type: InfoPointType; // ประเภทของจุดสนใจ ('info' หรือ 'scene')
  linkTo?: string; // สำหรับเก็บ ID ของ scene ที่ต้องการเปลี่ยนไป
}

export interface TourLocation {
  id: string;
  name: string;
  description: string;
  image: string;
  infoPoints: InfoPoint[];
}

// โครงสร้างข้อมูลใหม่สำหรับ API บันทึกรูปและจุดสนใจ
export interface TourData {
  id: string;
  title: string;
  description: string;
  location?: string; // เพิ่มตำแหน่งที่ตั้งของสถานที่
  imagePath: string;
  createdAt: string;
  infoPoints: InfoPoint[];
}

// โครงสร้างข้อมูลเดิมสำหรับความเข้ากันได้กับโค้ดเก่า
export interface LegacyTourData {
  locations: TourLocation[];
}
