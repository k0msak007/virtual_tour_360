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
  type?: 'info' | 'scene' // ประเภทของจุดสนใจ (แสดงรายละเอียดหรือเปลี่ยน scene)
  linkTo?: string // รหัสของ scene ที่ต้องการเชื่อมต่อ
}

interface TourLocation {
  id: string
  name: string
  description: string
  image: string
  infoPoints: InfoPoint[]
}

interface StreetViewTourProps {
  initialLocation?: TourLocation
  allLocations?: TourLocation[] // เพิ่ม prop สำหรับรับข้อมูล locations ทั้งหมด
  onInfoPointPlace?: (position: { yaw: number; pitch: number }) => void
  onLocationChange?: (locationId: string) => void // เพิ่ม prop สำหรับแจ้งเมื่อมีการเปลี่ยน scene
  onInfoPointClick?: (infoPointId: string) => void // เพิ่ม prop สำหรับแจ้งเมื่อคลิกที่จุดสนใจ
}

// ลบข้อมูล mockup ออก
const tourLocations: TourLocation[] = []

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

export function StreetViewTour({ initialLocation, allLocations = [], onInfoPointPlace, onLocationChange, onInfoPointClick }: StreetViewTourProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const animationIdRef = useRef<number>(0)
  const infoPointMeshesRef = useRef<{ [key: string]: any }>({})

  const [currentLocationId, setCurrentLocationId] = useState(initialLocation?.id || "brasov-city")
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

  // Combine provided locations with any custom location
  const availableLocations = initialLocation && !allLocations.some(loc => loc.id === initialLocation.id)
    ? [...allLocations, initialLocation]
    : allLocations

  // เพิ่มค่าเริ่มต้นเป็น null เพื่อให้ TypeScript รู้ว่าอาจเป็น undefined ได้
  const currentLocation = availableLocations.find((loc) => loc.id === currentLocationId) || null

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

    // เพิ่มการตรวจสอบว่า infoPoints มีค่าหรือไม่
    const infoPoints = currentLocation.infoPoints || []
    
    infoPoints.forEach((infoPoint) => {
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
    // Set loading state
    setIsLoading(true)
    
    const loadThreeJS = async () => {
      try {
        // Check if container exists
        if (!containerRef.current) {
          console.error("Container reference is not available")
          return
        }
        
        // Load Three.js if not already loaded
        if (!window.THREE) {
          console.log("Loading Three.js library...")
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          script.async = true
          document.head.appendChild(script)

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = () => reject(new Error("Failed to load Three.js"))
          })
          console.log("Three.js library loaded successfully")
        }

        // Small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Initialize Three.js
        console.log("Initializing Three.js scene...")
        initializeThreeJS()
      } catch (error) {
        console.error("Error initializing Three.js:", error)
        setIsLoading(false)
      }
    }

    // Start loading process
    loadThreeJS()

    return () => {
      console.log("Cleaning up Three.js resources")
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

  // Define updatePanorama function before it's used
  const updatePanorama = (imageUrl: string) => {
    if (!sphereRef.current || !window.THREE) {
      console.error("Cannot update panorama: sphere or THREE not available")
      return
    }

    console.log("Loading panorama texture:", imageUrl)
    setIsTransitioning(true)
    
    const THREE = window.THREE
    const loader = new THREE.TextureLoader()

    loader.load(
      imageUrl,
      (texture: any) => {
        console.log("Texture loaded successfully")
        texture.minFilter = THREE.LinearFilter
        if (sphereRef.current) {
          sphereRef.current.material.map = texture
          sphereRef.current.material.needsUpdate = true
        }
        setIsTransitioning(false)
        updateInfoPointPositions()
      },
      (progress: any) => {
        // Optional: Show loading progress
        console.log(`Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`)
      },
      (error: any) => {
        console.error("Error loading texture:", error)
        setIsTransitioning(false)
      },
    )
  }

  const initializeThreeJS = () => {
    try {
      // Double check that container and Three.js are available
      if (!containerRef.current) {
        console.error("Container reference is still not available")
        return
      }
      
      if (!window.THREE) {
        console.error("Three.js is not loaded")
        return
      }

      console.log("Starting Three.js initialization")
      const THREE = window.THREE

      // Clear any existing content in the container
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }

      // Scene
      const scene = new THREE.Scene()
      sceneRef.current = scene
      console.log("Scene created")

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        containerRef.current.clientWidth / containerRef.current.clientHeight, 
        0.1, 
        1000
      )
      camera.position.set(0, 0, 0)
      cameraRef.current = camera
      console.log("Camera created")

      // Renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit pixel ratio for performance
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer
      console.log("Renderer created and attached to DOM")

      // Sphere geometry for panorama
      const geometry = new THREE.SphereGeometry(500, 60, 40)
      geometry.scale(-1, 1, 1) // Invert to see from inside

      // Material
      const material = new THREE.MeshBasicMaterial()
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)
      sphereRef.current = sphere
      console.log("Sphere geometry created")
      
      // Force initial render
      renderer.render(scene, camera)

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
      
      // Add double click event listener for info point placement
      if (onInfoPointPlace) {
        canvas.addEventListener("dblclick", (event: MouseEvent) => {
          if (!onInfoPointPlace || !containerRef.current) return
          
          // Get mouse position relative to container
          const rect = containerRef.current.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top
          
          // Convert to normalized device coordinates (-1 to +1)
          const mouseX = (x / containerRef.current.clientWidth) * 2 - 1
          const mouseY = -(y / containerRef.current.clientHeight) * 2 + 1
          
          // Create raycaster
          const raycaster = new THREE.Raycaster()
          raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera)
          
          // Intersect with sphere (our panorama)
          const intersects = raycaster.intersectObject(sphere)
          
          if (intersects.length > 0) {
            // Get the raw intersection point without normalization
            const hitPoint = intersects[0].point.clone()
            
            // เพิ่มการ debug เพื่อดูค่าต่างๆ
            console.log('Intersection point:', hitPoint);
            console.log('Camera rotation:', cameraRef.current ? {
              x: radToDeg(cameraRef.current.rotation.x),
              y: radToDeg(cameraRef.current.rotation.y),
              z: radToDeg(cameraRef.current.rotation.z)
            } : 'No camera');
            
            // วิธีการใหม่ที่แก้ปัญหาการวางตำแหน่งจุดสนใจ
            // เราจะใช้การคำนวณโดยตรงจากจุดที่ถูกคลิกบนทรงกลม
            
            // สร้างเวกเตอร์จากจุดศูนย์กลางไปยังจุดที่คลิก
            const center = new THREE.Vector3(0, 0, 0);
            const clickVector = hitPoint.clone().sub(center).normalize();
            
            // แปลงเป็นค่า spherical เพื่อหาค่า yaw และ pitch
            const sphericalCoords = new THREE.Spherical().setFromVector3(clickVector);
            
            // แปลงเป็นองศา
            let yaw = radToDeg(sphericalCoords.theta);
            let pitch = radToDeg(Math.PI / 2 - sphericalCoords.phi);
            
            console.log('Direct spherical calculation - yaw:', yaw, 'pitch:', pitch);
            
            // ทำให้ yaw อยู่ในช่วง -180 ถึง 180
            yaw = ((yaw + 180) % 360) - 180;
            
            // จำกัดค่า pitch ให้อยู่ในช่วง -90 ถึง 90
            pitch = Math.max(-90, Math.min(90, pitch));
            
            // ปรับค่าชดเชยสุดท้ายเพื่อให้ตำแหน่งตรงกับจุดที่คลิก
            // ปรับค่า pitch ลงเล็กน้อยเพื่อให้จุดไม่ลอยขึ้นไปด้านบน
            const finalYawOffset = 0;
            const finalPitchOffset = -2.5; // ปรับลงเล็กน้อยเพื่อให้จุดตรงกับที่คลิกพอดี
            
            yaw += finalYawOffset;
            pitch += finalPitchOffset;
            
            console.log(`Raycasting result: yaw: ${yaw.toFixed(2)}, pitch: ${pitch.toFixed(2)}`)
            
            // Call the callback with the calculated position
            onInfoPointPlace({ yaw, pitch })
          }
        })
      }

      // Load initial panorama
      if (currentLocation) {
        updatePanorama(currentLocation.image)
      } else {
        console.warn('No current location available to load panorama')
        setIsLoading(false)
      }

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        updateInfoPointPositions()
      }
      
      // Handle double click for placing info points using raycasting
      const handleDoubleClick = (event: MouseEvent) => {
        if (!onInfoPointPlace || !containerRef.current) return
        
        // Get mouse position relative to container
        const rect = containerRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        // Convert to normalized device coordinates (-1 to +1)
        const mouseX = (x / containerRef.current.clientWidth) * 2 - 1
        const mouseY = -(y / containerRef.current.clientHeight) * 2 + 1
        
        // Create raycaster
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera)
        
        // Intersect with sphere (our panorama)
        const intersects = raycaster.intersectObject(sphereRef.current)
        
        if (intersects.length > 0) {
          // Get intersection point
          const point = intersects[0].point.normalize()
          
          // Convert to spherical coordinates
          let phi = Math.atan2(point.z, point.x)
          let theta = Math.acos(point.y)
          
          // Convert to degrees
          let yaw = radToDeg(phi)
          let pitch = 90 - radToDeg(theta)
          
          console.log(`Raycasting result: yaw: ${yaw.toFixed(2)}, pitch: ${pitch.toFixed(2)}`)
          
          // Call the callback with the calculated position
          onInfoPointPlace({ yaw, pitch })
        }
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
      console.log("Three.js initialization complete")
    } catch (error) {
      console.error("Error in initializeThreeJS:", error)
      setIsLoading(false)
    }

    // This is a duplicate animation loop that's already defined in the try block above
    // Removing it to prevent conflicts
  }

  // updatePanorama function is now defined earlier in the component

  const navigateToLocation = (locationId: string) => {
    if (isTransitioning || locationId === currentLocationId) return

    setIsTransitioning(true)
    
    // ตรวจสอบว่ามี location ที่ต้องการหรือไม่
    const targetLocation = availableLocations.find(loc => loc.id === locationId)
    
    if (targetLocation) {
      // ถ้าพบ location ที่ต้องการ ให้เปลี่ยนไปยัง location นั้น
      setCurrentLocationId(locationId)
      rotationRef.current = { x: 0, y: 0 }
      updateCompass()
      
      // แจ้งการเปลี่ยน location กลับไปยัง parent component
      if (onLocationChange) {
        onLocationChange(locationId)
      }
      
      // อัปเดตภาพพาโนรามา
      setTimeout(() => {
        updatePanorama(targetLocation.image)
        setIsTransitioning(false)
      }, 1000)
    } else {
      // ถ้าไม่พบ location ที่ต้องการ ให้แสดงข้อความแจ้งเตือนและยกเลิกการเปลี่ยน scene
      console.error(`Location with ID ${locationId} not found`)
      setIsTransitioning(false)
      
      // แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบ (อาจเพิ่ม UI สำหรับแสดงข้อความแจ้งเตือนในอนาคต)
      alert(`ไม่พบสถานที่ที่ต้องการ (ID: ${locationId})`)
    }
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
    // ถ้ามี prop onInfoPointClick ให้เรียกใช้ prop นี้
    if (onInfoPointClick) {
      onInfoPointClick(infoPoint.id)
      return
    }
    
    // ถ้าเป็นจุดสนใจประเภท scene ให้เปลี่ยน scene ไปยัง scene ที่ระบุใน linkTo
    if (infoPoint.type === 'scene' && infoPoint.linkTo) {
      console.log(`Navigating to location: ${infoPoint.linkTo}`)
      navigateToLocation(infoPoint.linkTo)
    } else {
      // ถ้าเป็นจุดสนใจประเภท info ให้แสดงรายละเอียดของจุดสนใจ
      setSelectedInfoPoint(infoPoint)
      setShowInfo(true)
    }
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
      {!isLoading && currentLocation && Array.isArray(currentLocation.infoPoints) && 
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
                {allLocations.map((location, index) => (
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
    </div>
  )
}
