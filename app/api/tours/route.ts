import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TourData, InfoPoint } from '@/types/tour-types';

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

// API สำหรับดึงข้อมูลทั้งหมด
export async function GET() {
  const tours = readToursData();
  return NextResponse.json(tours);
}

// API สำหรับบันทึกข้อมูลใหม่
export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก request
    const formData = await request.formData();
    
    // ดึงข้อมูลรูปภาพ
    const imageFile = formData.get('image') as File;
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    // ดึงข้อมูลจุดสนใจ (infoPoints) จาก request
    const infoPointsJson = formData.get('infoPoints') as string;
    if (!infoPointsJson) {
      return NextResponse.json({ error: 'No info points provided' }, { status: 400 });
    }
    
    const infoPoints: InfoPoint[] = JSON.parse(infoPointsJson);
    
    // สร้าง ID สำหรับทัวร์ใหม่
    const tourId = uuidv4();
    
    // สร้างชื่อไฟล์ใหม่สำหรับรูปภาพ
    const fileExtension = imageFile.name.split('.').pop();
    const newFileName = `${tourId}.${fileExtension}`;
    const imagePath = `/images/tours/${newFileName}`;
    
    // บันทึกไฟล์รูปภาพ
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageDir = path.join(process.cwd(), 'public', 'images', 'tours');
    fs.mkdirSync(imageDir, { recursive: true });
    fs.writeFileSync(path.join(imageDir, newFileName), imageBuffer);
    
    // สร้างข้อมูลทัวร์ใหม่
    const newTour: TourData = {
      id: tourId,
      title: formData.get('title') as string || 'Untitled Tour',
      description: formData.get('description') as string || '',
      location: formData.get('location') as string || '',
      imagePath,
      createdAt: new Date().toISOString(),
      infoPoints,
    };
    
    // อ่านข้อมูลเดิมและเพิ่มข้อมูลใหม่
    const tours = readToursData();
    tours.push(newTour);
    
    // บันทึกข้อมูลลงไฟล์
    writeToursData(tours);
    
    return NextResponse.json({ success: true, tour: newTour });
  } catch (error) {
    console.error('Error saving tour data:', error);
    return NextResponse.json({ error: 'Failed to save tour data' }, { status: 500 });
  }
}

// API สำหรับอัปเดตข้อมูลที่มีอยู่แล้ว
export async function PUT(request: NextRequest) {
  try {
    const { id, infoPoints, title, description } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
    }
    
    // อ่านข้อมูลเดิม
    const tours = readToursData();
    const tourIndex = tours.findIndex(tour => tour.id === id);
    
    if (tourIndex === -1) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    
    // อัปเดตข้อมูล
    if (infoPoints) tours[tourIndex].infoPoints = infoPoints;
    if (title) tours[tourIndex].title = title;
    if (description) tours[tourIndex].description = description;
    
    // บันทึกข้อมูลลงไฟล์
    writeToursData(tours);
    
    return NextResponse.json({ success: true, tour: tours[tourIndex] });
  } catch (error) {
    console.error('Error updating tour data:', error);
    return NextResponse.json({ error: 'Failed to update tour data' }, { status: 500 });
  }
}

// API สำหรับลบข้อมูล
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
    }
    
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
