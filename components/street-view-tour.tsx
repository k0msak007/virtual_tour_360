"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Info, Menu, X, RotateCcw, Maximize, Home, InfoIcon, Building, TreePine, Store } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoPoint {
  id: string
  // ใช้ spherical coordinates แทน x,y percentage
  yaw: number // horizontal angle in degrees (-180 to 180)
  pitch: number // vertical angle in degrees (-90 to 90)
  distance: number // distance from center (default 400)
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

const tourLocations: TourLocation[] = [
  {
    id: "brasov-city",
    name: "เมืองบราซอฟ โรมาเนีย",
    description: "วิวพาโนรามาของเมืองเก่าบราซอฟ ที่มีสถาปัตยกรรมยุโรปโบราณและภูเขาล้อมรอบ",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aerial-drone-panoramic-view-old-brasov-centre-romania.jpg-qabqKqeirSJMELHQ6fK0i2Vprikot8.jpeg",
    infoPoints: [
      {
        id: "info1",
        yaw: -60, // ซ้าย
        pitch: -10, // เล็กน้อยลง
        distance: 400,
        title: "ศาลาว่าการเมือง",
        description: "อาคารศาลาว่าการเมืองบราซอฟที่สร้างในศตวรรษที่ 15",
        details:
          "อาคารนี้เป็นสัญลักษณ์สำคัญของเมืองบราซอฟ สร้างขึ้นในสมัยจักรวรรดิออสโตร-ฮังการี มีสถาปัตยกรรมแบบโกธิคที่งดงาม และเป็นที่ตั้งของรัฐบาลท้องถิ่นมาจนถึงปัจจุบัน",
        icon: "building",
      },
      {
        id: "info2",
        yaw: 30, // ขวา
        pitch: -20, // มองลง
        distance: 450,
        title: "ภูเขาทัมปา",
        description: "ภูเขาที่มีชื่อเสียงล้อมรอบเมืองบราซอฟ",
        details:
          "ภูเขาทัมปาเป็นสัญลักษณ์ของเมืองบราซอฟ มีความสูง 955 เมตร บนยอดเขามีป้าย 'BRASOV' คล้ายกับป้าย Hollywood ที่ลอสแองเจลิส นักท่องเที่ยวสามารถขึ้นไปชมวิวได้ด้วยกระเช้าลิฟต์",
        icon: "mountain",
      },
      {
        id: "info3",
        yaw: 120, // หลัง
        pitch: 5, // เล็กน้อยขึ้น
        distance: 380,
        title: "ตลาดเก่า",
        description: "ตลาดแบบดั้งเดิมในใจกลางเมือง",
        details:
          "ตลาดเก่าแห่งนี้เป็นจุดซื้อขายสินค้าท้องถิ่นมาตั้งแต่ศตวรรษที่ 14 มีสินค้าหัตถกรรม อาหารพื้นเมือง และของที่ระลึกมากมาย เป็นสถานที่ที่นักท่องเที่ยวนิยมมาเยือน",
        icon: "store",
      },
    ],
  },
  {
    id: "japanese-room",
    name: "ห้องสไตล์ญี่ปุ่น",
    description: "ห้องแบบดั้งเดิมญี่ปุ่นที่มีเสื่อทาทามิ โต๊ะต่ำ และการตกแต่งแบบดั้งเดิม",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5.jpg-GisNOSI4ed6o7UMhHxorZTGNl6eECG.jpeg",
    infoPoints: [
      {
        id: "info4",
        yaw: -45,
        pitch: 15,
        distance: 350,
        title: "เสื่อทาทามิ",
        description: "เสื่อทาทามิแบบดั้งเดิมญี่ปุ่น",
        details:
          "เสื่อทาทามิทำจากฟางข้าวที่ถักแน่น เป็นพื้นผิวที่นุ่มและระบายอากาศได้ดี ใช้ในบ้านญี่ปุ่นมาเป็นเวลาหลายศตวรรษ มีกลิ่นหอมธรรมชาติและช่วยควบคุมความชื้น",
        icon: "building",
      },
      {
        id: "info5",
        yaw: 60,
        pitch: -5,
        distance: 320,
        title: "โต๊ะชาญี่ปุ่น",
        description: "โต๊ะต่ำสำหรับพิธีชา",
        details:
          "โต๊ะชาแบบดั้งเดิมที่ใช้ในพิธีชาญี่ปุ่น (Chanoyu) ทำจากไม้คุณภาพสูง มีการออกแบบที่เรียบง่ายแต่สวยงาม สะท้อนปรัชญาญี่ปุ่นเรื่องความเรียบง่ายและความสงบ",
        icon: "building",
      },
    ],
  },
  {
    id: "underground-market",
    name: "ตลาดใต้ดิน",
    description: "ตลาดใต้ดินแบบดั้งเดิมที่มีโคมไฟแดงและร้านค้าปิดประตูเหล็ก บรรยากาศแบบเอเชีย",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.jpg-t6EdNidsb1TwblIske9MKnDk4vwyVG.jpeg",
    infoPoints: [
      {
        id: "info6",
        yaw: 0,
        pitch: -15,
        distance: 300,
        title: "โคมไฟแดง",
        description: "โคมไฟแดงแบบดั้งเดิม",
        details:
          "โคมไฟแดงเหล่านี้เป็นสัญลักษณ์ของตลาดใต้ดินในเอเชีย ให้แสงสีแดงอุ่นๆ ที่สร้างบรรยากาศลึกลับและน่าค้นหา เป็นการออกแบบที่ได้รับอิทธิพลจากวัฒนธรรมจีนและญี่ปุ่น",
        icon: "building",
      },
      {
        id: "info7",
        yaw: 90,
        pitch: 0,
        distance: 350,
        title: "ร้านค้าโบราณ",
        description: "ร้านค้าที่ปิดประตูเหล็ก",
        details:
          "ร้านค้าเหล่านี้เป็นร้านค้าแบบดั้งเดิมที่มีประตูเหล็กม้วน เมื่อปิดแล้วจะสร้างบรรยากาศที่ลึกลับ เป็นสถาปัตยกรรมที่พบได้ทั่วไปในตลาดเก่าของเอเชีย",
        icon: "store",
      },
    ],
  },
]

declare global {
  interface Window {
    THREE: any
  }
}

// Icon component selector
const getIcon = (iconType: string) => {
  switch (iconType) {
    case "building":
      return Building
    case "mountain":
      return TreePine
    case "store":
      return Store
    default:
      return InfoIcon
  }
}

export function StreetViewTour() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)
  const infoPointMeshesRef = useRef<{ [key: string]: any }>({})

  const [currentLocationId, setCurrentLocationId] = useState("brasov-city")
  const [showInfo, setShowInfo] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedInfoPoint, setSelectedInfoPoint] = useState<InfoPoint | null>(null)
  const [infoPointPositions, setInfoPointPositions] = useState<{
    [key: string]: { x: number; y: number; visible: boolean; scale: number }
  }>({})

  // Use refs for rotation to avoid stale closures
  const rotationRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const currentRotationDisplayRef = useRef<HTMLDivElement>(null)

  const currentLocation = tourLocations.find((loc) => loc.id === currentLocationId)!

  // Convert radians to degrees
  const radToDeg = (rad: number) => (rad * 180) / Math.PI

  // Convert degrees to radians
  const degToRad = (deg: number) => (deg * Math.PI) / 180

  // Convert spherical coordinates to 3D position
  const sphericalToCartesian = (yaw: number, pitch: number, distance: number) => {
    const yawRad = degToRad(yaw)
    const pitchRad = degToRad(pitch)

    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad)
    const y = distance * Math.sin(pitchRad)
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad)

    return { x, y, z }
  }

  // Project 3D position to screen coordinates
  const projectToScreen = useCallback((position: { x: number; y: number; z: number }) => {
    if (!cameraRef.current || !rendererRef.current) return null

    const THREE = window.THREE
    const vector = new THREE.Vector3(position.x, position.y, position.z)

    // Project to screen space
    vector.project(cameraRef.current)

    // Convert to screen coordinates
    const canvas = rendererRef.current.domElement
    const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth
    const y = (vector.y * -0.5 + 0.5) * canvas.clientHeight

    // Check if point is behind camera
    const isVisible = vector.z < 1

    // Calculate distance for scaling
    const distance = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z)
    const scale = Math.max(0.5, Math.min(1.5, 500 / distance))

    return { x, y, visible: isVisible, scale }
  }, [])

  // Update info point positions
  const updateInfoPointPositions = useCallback(() => {
    if (!currentLocation || isLoading) return

    const newPositions: { [key: string]: { x: number; y: number; visible: boolean; scale: number } } = {}

    currentLocation.infoPoints.forEach((infoPoint) => {
      const position3D = sphericalToCartesian(infoPoint.yaw, infoPoint.pitch, infoPoint.distance)
      const screenPos = projectToScreen(position3D)

      if (screenPos) {
        newPositions[infoPoint.id] = screenPos
      }
    })

    setInfoPointPositions(newPositions)
  }, [currentLocation, isLoading, projectToScreen])

  // Update compass display
  const updateCompass = useCallback(() => {
    if (currentRotationDisplayRef.current) {
      let degrees = Math.round(radToDeg(rotationRef.current.y))
      degrees = ((degrees % 360) + 360) % 360
      currentRotationDisplayRef.current.textContent = `${degrees}°`
    }
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback((event: MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: event.clientX, y: event.clientY }
    if (rendererRef.current?.domElement) {
      rendererRef.current.domElement.style.cursor = "grabbing"
    }
    event.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = event.clientX - lastMouseRef.current.x
      const deltaY = event.clientY - lastMouseRef.current.y

      // Update rotation
      rotationRef.current.y -= deltaX * 0.005
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x - deltaY * 0.005))

      // Update compass and info points
      updateCompass()
      updateInfoPointPositions()

      lastMouseRef.current = { x: event.clientX, y: event.clientY }
    },
    [updateCompass, updateInfoPointPositions],
  )

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    if (rendererRef.current?.domElement) {
      rendererRef.current.domElement.style.cursor = "grab"
    }
  }, [])

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      isDraggingRef.current = true
      lastMouseRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      event.preventDefault()
    }
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isDraggingRef.current || event.touches.length !== 1) return

      const deltaX = event.touches[0].clientX - lastMouseRef.current.x
      const deltaY = event.touches[0].clientY - lastMouseRef.current.y

      // Update rotation
      rotationRef.current.y -= deltaX * 0.005
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x - deltaY * 0.005))

      // Update compass and info points
      updateCompass()
      updateInfoPointPositions()

      lastMouseRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      event.preventDefault()
    },
    [updateCompass, updateInfoPointPositions],
  )

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  // Load Three.js and initialize
  useEffect(() => {
    const loadThreeJS = async () => {
      if (!window.THREE) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        script.async = true
        document.head.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      initializeThreeJS()
    }

    loadThreeJS()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Update panorama when location changes
  useEffect(() => {
    if (sphereRef.current && currentLocation) {
      updatePanorama(currentLocation.image)
      setSelectedInfoPoint(null)
    }
  }, [currentLocationId])

  // Update info points positions on every frame
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isTransitioning) {
        updateInfoPointPositions()
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [updateInfoPointPositions, isLoading, isTransitioning])

  const initializeThreeJS = () => {
    if (!containerRef.current || !window.THREE) return

    const THREE = window.THREE

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Sphere geometry for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Invert to see from inside

    // Material
    const material = new THREE.MeshBasicMaterial()
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)
    sphereRef.current = sphere

    // Set up controls
    const canvas = renderer.domElement
    canvas.style.cursor = "grab"
    canvas.style.userSelect = "none"

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    // Load initial panorama
    updatePanorama(currentLocation.image)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      updateInfoPointPositions()
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      // Apply rotation to camera
      if (cameraRef.current) {
        cameraRef.current.rotation.x = rotationRef.current.x
        cameraRef.current.rotation.y = rotationRef.current.y
        cameraRef.current.rotation.order = "YXZ"
      }

      renderer.render(scene, camera)
    }

    animate()
    setIsLoading(false)
  }

  const updatePanorama = (imageUrl: string) => {
    if (!sphereRef.current || !window.THREE) return

    const THREE = window.THREE
    const loader = new THREE.TextureLoader()

    loader.load(
      imageUrl,
      (texture: any) => {
        texture.minFilter = THREE.LinearFilter
        sphereRef.current.material.map = texture
        sphereRef.current.material.needsUpdate = true
        setIsTransitioning(false)
        updateInfoPointPositions()
      },
      undefined,
      (error: any) => {
        console.error("Error loading texture:", error)
        setIsTransitioning(false)
      },
    )
  }

  const navigateToLocation = (locationId: string) => {
    if (isTransitioning || locationId === currentLocationId) return

    setIsTransitioning(true)
    setCurrentLocationId(locationId)
    rotationRef.current = { x: 0, y: 0 }
    updateCompass()
  }

  const resetView = () => {
    rotationRef.current = { x: 0, y: 0 }
    updateCompass()
    updateInfoPointPositions()
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen()
    }
  }

  const handleInfoPointClick = (infoPoint: InfoPoint) => {
    setSelectedInfoPoint(infoPoint)
  }

  const closeInfoPoint = () => {
    setSelectedInfoPoint(null)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const step = 0.1
      switch (event.key) {
        case "ArrowLeft":
          rotationRef.current.y -= step
          updateCompass()
          updateInfoPointPositions()
          break
        case "ArrowRight":
          rotationRef.current.y += step
          updateCompass()
          updateInfoPointPositions()
          break
        case "ArrowUp":
          rotationRef.current.x = Math.max(-Math.PI / 2, rotationRef.current.x - step)
          updateInfoPointPositions()
          break
        case "ArrowDown":
          rotationRef.current.x = Math.min(Math.PI / 2, rotationRef.current.x + step)
          updateInfoPointPositions()
          break
        case "Escape":
          closeInfoPoint()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [updateCompass, updateInfoPointPositions])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-white text-xl">กำลังโหลด Virtual Tour...</div>
          </div>
        </div>
      )}

      {/* Transition overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="text-white text-xl">กำลังเดินทาง...</div>
        </div>
      )}

      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Info Points - Positioned using 3D projection */}
      {!isLoading &&
        currentLocation.infoPoints.map((infoPoint) => {
          const position = infoPointPositions[infoPoint.id]
          if (!position || !position.visible) return null

          const IconComponent = getIcon(infoPoint.icon)
          return (
            <button
              key={infoPoint.id}
              className="absolute group z-20 transition-all duration-200"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%) scale(${position.scale})`,
              }}
              onClick={() => handleInfoPointClick(infoPoint)}
            >
              <div className="relative">
                {/* Subtle glow background */}
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md scale-150 opacity-50"></div>

                {/* Main icon with natural styling */}
                <div className="relative w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 hover:bg-white">
                  <IconComponent className="w-6 h-6 text-gray-700 drop-shadow-sm" />
                </div>

                {/* Subtle pulse ring */}
                <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-20"></div>

                {/* Tooltip with better positioning */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none">
                  <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl border border-gray-600 backdrop-blur-sm">
                    {infoPoint.title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}

      {/* Info Point Detail Modal */}
      {selectedInfoPoint && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    {(() => {
                      const IconComponent = getIcon(selectedInfoPoint.icon)
                      return <IconComponent className="w-6 h-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-bold text-2xl">{selectedInfoPoint.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">{selectedInfoPoint.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  onClick={closeInfoPoint}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-gray-900 font-semibold text-lg mb-3">รายละเอียด</h3>
                <p className="text-gray-700 leading-relaxed">{selectedInfoPoint.details}</p>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={closeInfoPoint}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ปิด
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Direction Indicator with compass style */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gradient-to-br from-black/95 to-gray-900/95 rounded-2xl px-8 py-4 backdrop-blur-md border border-gray-600/50 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <div className="text-white text-lg font-mono font-bold tracking-wider">
              <span className="text-gray-400 text-sm mr-1">N</span>
              <span ref={currentRotationDisplayRef}>0°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-30">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/95 border-gray-600/50 hover:bg-black/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 w-12 h-12"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5 text-white" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/95 border-gray-600/50 hover:bg-black/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 w-12 h-12"
            onClick={() => setShowMinimap(!showMinimap)}
          >
            <Menu className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <Card className="bg-gradient-to-br from-black/95 to-gray-900/95 border-gray-600/50 backdrop-blur-md shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 w-12 h-12 rounded-xl"
                onClick={() => navigateToLocation("brasov-city")}
                title="กลับหน้าแรก"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div className="w-px h-8 bg-gray-600/50"></div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 w-12 h-12 rounded-xl"
                onClick={resetView}
                title="รีเซ็ตมุมมอง"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 w-12 h-12 rounded-xl"
                onClick={toggleFullscreen}
                title="เต็มจอ"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Minimap */}
      {showMinimap && (
        <div className="absolute top-20 right-6 z-40 animate-in slide-in-from-right-5 duration-300">
          <Card className="bg-gradient-to-br from-black/98 to-gray-900/98 border-gray-600/50 w-80 backdrop-blur-md shadow-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">สถานที่ทั้งหมด</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110"
                  onClick={() => setShowMinimap(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tourLocations.map((location, index) => (
                  <button
                    key={location.id}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all duration-300 hover:scale-105 group",
                      currentLocationId === location.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-300 hover:bg-white/10 hover:text-white border border-gray-700/50",
                    )}
                    onClick={() => navigateToLocation(location.id)}
                    disabled={isTransitioning}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                          currentLocationId === location.id
                            ? "bg-white/20"
                            : "bg-gray-700/50 group-hover:bg-gray-600/50",
                        )}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{location.name}</div>
                        <div className="text-xs opacity-75 mt-1 line-clamp-2">{location.description}</div>
                      </div>
                      {currentLocationId === location.id && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-24 left-6 z-40 animate-in slide-in-from-left-5 duration-300">
          <Card className="bg-gradient-to-br from-black/98 to-gray-900/98 border-gray-600/50 w-96 backdrop-blur-md shadow-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">วิธีการใช้งาน</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110"
                  onClick={() => setShowInfo(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20">
                  <Badge variant="secondary" className="mb-2 bg-blue-600/20 text-blue-300 border-blue-500/30">
                    🖱️ ลากเมาส์
                  </Badge>
                  <p className="text-gray-200">ลากเมาส์เพื่อมองรอบทิศทาง 360°</p>
                </div>
                <div className="p-3 rounded-lg bg-green-600/10 border border-green-500/20">
                  <Badge variant="secondary" className="mb-2 bg-green-600/20 text-green-300 border-green-500/30">
                    📱 ลากนิ้ว
                  </Badge>
                  <p className="text-gray-200">ลากนิ้วบนหน้าจอสัมผัสเพื่อมองรอบ</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-600/10 border border-purple-500/20">
                  <Badge variant="secondary" className="mb-2 bg-purple-600/20 text-purple-300 border-purple-500/30">
                    ℹ️ จุดข้อมูล
                  </Badge>
                  <p className="text-gray-200">จุดข้อมูลฝังอยู่ในภาพ คลิกเพื่อดูรายละเอียดสถานที่</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-600/10 border border-orange-500/20">
                  <Badge variant="secondary" className="mb-2 bg-orange-600/20 text-orange-300 border-orange-500/30">
                    🗺️ เปลี่ยนสถานที่
                  </Badge>
                  <p className="text-gray-200">คลิกปุ่มเมนูเพื่อเลือกสถานที่ที่ต้องการเยี่ยมชม</p>
                </div>
                <div className="p-3 rounded-lg bg-red-600/10 border border-red-500/20">
                  <Badge variant="secondary" className="mb-2 bg-red-600/20 text-red-300 border-red-500/30">
                    🧭 เข็มทิศ
                  </Badge>
                  <p className="text-gray-200">ดูทิศทางปัจจุบันจากเข็มทิศด้านบน</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
