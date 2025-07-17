import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TourData } from '@/types/tour-types';

// กำหนดพาธของไฟล์ JSON ที่จะใช้เก็บข้อมูล
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'tour-data.json');

// ฟังก์ชันสำหรับอ่านข้อมูลจากไฟล์ JSON
function readToursData(): TourData[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // ถ้าไฟล์ไม่มีอยู่ ให้สร้างไฟล์ใหม่พร้อมอาร์เรย์ว่าง
      fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tours data:', error);
    return [];
  }
}

// ฟังก์ชันสำหรับเขียนข้อมูลลงไฟล์ JSON
function writeToursData(data: TourData[]): void {
  try {
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing tours data:', error);
  }
}

// API สำหรับดึงข้อมูลทัวร์ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ต้องใช้ await กับ params ใน Next.js 14+
  const { id } = await params;
  
  // อ่านข้อมูลทั้งหมด
  const tours = readToursData();
  
  // ค้นหาทัวร์ตาม ID
  const tour = tours.find(tour => tour.id === id);
  
  if (!tour) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
  }
  
  return NextResponse.json(tour);
}

// API สำหรับอัปเดตข้อมูลทัวร์ตาม ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ต้องใช้ await กับ params ใน Next.js 14+
    const { id } = await params;
    const tourData = await request.json();
    
    // อ่านข้อมูลเดิม
    const tours = readToursData();
    const tourIndex = tours.findIndex(tour => tour.id === id);
    
    if (tourIndex === -1) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    
    // สำคัญ: ต้องเก็บข้อมูลเดิมที่ไม่ได้อัปเดต โดยเฉพาะ infoPoints
    const updatedTour = {
      ...tours[tourIndex],
      ...tourData,
      id: id, // ป้องกันการเปลี่ยน ID
    };
    
    // อัปเดตข้อมูลในอาร์เรย์
    tours[tourIndex] = updatedTour;
    
    // บันทึกข้อมูลลงไฟล์
    writeToursData(tours);
    
    return NextResponse.json({ success: true, tour: updatedTour });
  } catch (error) {
    console.error('Error updating tour data:', error);
    return NextResponse.json({ error: 'Failed to update tour data' }, { status: 500 });
  }
}

// API สำหรับลบข้อมูลทัวร์ตาม ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ต้องใช้ await กับ params ใน Next.js 14+
    const { id } = await params;
    
    // อ่านข้อมูลเดิม
    const tours = readToursData();
    const tourIndex = tours.findIndex(tour => tour.id === id);
    
    if (tourIndex === -1) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    
    // ลบไฟล์รูปภาพ (ถ้ามี)
    const tourToDelete = tours[tourIndex];
    if (tourToDelete.imagePath) {
      const imagePath = path.join(process.cwd(), 'public', tourToDelete.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // ลบข้อมูลจากอาร์เรย์
    tours.splice(tourIndex, 1);
    
    // บันทึกข้อมูลลงไฟล์
    writeToursData(tours);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour data:', error);
    return NextResponse.json({ error: 'Failed to delete tour data' }, { status: 500 });
  }
}
