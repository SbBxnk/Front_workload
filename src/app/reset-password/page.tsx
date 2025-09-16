'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, Eye, EyeOff, Mail , KeyRound} from 'lucide-react'
import Swal from 'sweetalert2'
import Image from 'next/image'
import RMUTL_logo1 from '../../../public/images/rmutl_1_logo.png'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      // ตรวจสอบ token กับ backend
      validateToken(tokenParam)
    } else {
      setIsValidating(false)
      setIsTokenValid(false)
      Swal.fire({
        icon: 'error',
        title: 'Token ไม่ถูกต้อง!',
        text: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง',
        showConfirmButton: false,
        timer: 3000,
      }).then(() => {
        router.push('/login')
      })
    }
  }, [searchParams, router])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/validate-reset-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ token })
      })
      
      const data = await response.json()
      
      if (!data.status) {
        setIsValidating(false)
        setIsTokenValid(false)
        Swal.fire({
          icon: 'error',
          title: 'Token หมดอายุ!',
          text: data.message || 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่',
          showConfirmButton: false,
          timer: 3000,
        }).then(() => {
          router.push('/login')
        })
      } else {
        setIsValidating(false)
        setIsTokenValid(true)
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setIsValidating(false)
      setIsTokenValid(false)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถตรวจสอบ token ได้',
        showConfirmButton: false,
        timer: 3000,
      }).then(() => {
        router.push('/login')
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน!',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
        showConfirmButton: false,
        timer: 3000,
      })
      return
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านสั้นเกินไป!',
        text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        showConfirmButton: false,
        timer: 3000,
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`http://localhost:3333/api/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ token, newPassword: password })
      })
      
      const data = await response.json()
      
      if (data.status) {
        Swal.fire({
          icon: 'success',
          title: 'รีเซ็ตรหัสผ่านสำเร็จ!',
          text: data.message,
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          router.push('/login')
        })
      } else {
        if (data.message && (data.message.includes('Token') || data.message.includes('หมดอายุ'))) {
          Swal.fire({
            icon: 'error',
            title: 'Token หมดอายุ!',
            text: data.message,
            showConfirmButton: false,
            timer: 3000,
          }).then(() => {
            router.push('/login')
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: data.message,
            showConfirmButton: false,
            timer: 3000,
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        showConfirmButton: false,
        timer: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // แสดงพื้นหลังขาวเมื่อกำลังตรวจสอบ token
  if (isValidating) {
    return (
     null
    )
  }

  // แสดงพื้นหลังขาวเมื่อ token ไม่ถูกต้อง
  if (!isTokenValid) {
    return (
      null
    )
  }

  return (
      <>
      <div
        className="absolute h-full w-full bg-fixed bg-left bg-no-repeat"
        style={{
          backgroundImage: "url('/images/business_dept.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          zIndex: 0,
          opacity: '0.4',
        }}
      ></div>
      <div
        className="absolute h-full w-full bg-cover bg-fixed bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/layered-waves-haikei.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          zIndex: 0,
        }}
      ></div>
      <div className="container relative">
        <div className="flex h-screen items-center justify-center lg:grid lg:place-items-center">
          <div className="flex w-full flex-col-reverse items-center justify-between gap-20 p-0 md:my-0 md:pb-4 lg:flex-row">
            <div className="hidden h-full w-full lg:block">
              <div className="gird h-[400px] place-items-center">
                <div className="w-[500px]">
                  <h1 className="text-nowrap pr-4 text-start font-medium text-business1 lg:text-[38px]">
                    เว็บแอปพลิเคชันสำหรับบุคลากร
                  </h1>
                  <div className="mt-6 flex justify-between">
                    <Image
                      src={RMUTL_logo1 || '/placeholder.svg'}
                      alt="RMUTL"
                      width={100}
                      className="h-[100px] w-[100px] pr-4"
                    />
                    <div className="">
                      <h3 className="text-5xl font-medium text-gray-600">
                        SEWAP-RMUTLL
                      </h3>
                      <h3 className="text-md pr-4 text-gray-500">
                        Support System for Evaluating the Workload of Academic
                        Personnel at RMUTL Web Application
                      </h3>
                    </div>
                  </div>
                  <h1 className="text-md mt-2 pr-4 text-gray-400">
                    แอปพลิเคชันสำหรับบุคลากรในมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
                    ลำปาง เพื่อเข้าใช้งานในการประเมินภาระงานที่
                  </h1>
                </div>
              </div>
            </div>
            <div className="z-10 h-full w-full">
              <div className="grid place-items-center">
                <div className="card w-full border-2 border-gray-200 bg-white p-4 drop-shadow-[0px_0px_5px_rgba(0,0,0,0.09)] backdrop-blur-3xl md:w-[420px] md:bg-white/80 md:p-8">
                  <div className="space-y-4">
                    <div className="flex justify-center items-center flex-col gap-2">
                      <div className="flex w-20 h-20 items-center justify-center rounded-full bg-business1/10 p-2 mb-4">
                        <KeyRound className="h-10 w-10 text-business1" />
                      </div>
                      <p className="m-0 text-center text-xl font-medium text-business1 md:text-3xl">
                        รีเซ็ตรหัสผ่าน
                      </p>
                      <p className="text-md m-0 text-center font-light text-gray-500">
                        (กรอกรหัสผ่านใหม่ให้ตรงกัน)
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-2"
                    >
                      <div className="space-y-2">
                        <label className="text-md block font-medium text-gray-500">
                        รหัสผ่าน
                        </label>
                        <input
                          className="text-md w-full transform rounded-md border border-gray-300 px-4 py-2 font-light shadow-sm transition duration-300 ease-in-out hover:border-blue-300 focus:outline-blue-300"
                          placeholder="รหัสผ่าน"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-md block font-medium text-gray-500">
                          ยืนยันรหัสผ่าน
                        </label>
                        <input
                          className="text-md w-full transform rounded-md border border-gray-300 px-4 py-2 font-light shadow-sm transition duration-300 ease-in-out hover:border-blue-300 focus:outline-blue-300"
                          placeholder="ยืนยันรหัสผ่าน"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="text-md mt-2 w-full rounded-md bg-business1 px-4 py-2 text-center font-light text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? 'กำลังรีเซ็ตรหัสผ่าน...' : 'รีเซ็ตรหัสผ่าน'}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        disabled={loading}
                        className="text-md mt-2 w-full rounded-md bg-gray-500 px-4 py-2 text-center font-light text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                       กลับไปหน้าเข้าสู่ระบบ
                      </button>
                      <div className="divider m-0">
                        <p className="text-center text-sm text-gray-400">
                          หมายเหตุ
                        </p>
                      </div>
                      <p className="text-center text-sm text-gray-500">
                        กรณีพบปัญหาการเข้าใช้งาน หรือมีข้อสงสัย{' '}
                        <span className="text-business1 underline">
                          <a
                            href="https://www.rmutl.ac.th/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            ติดต่อได้ที่นี่
                          </a>
                        </span>
                      </p>
                      <p className="text-center text-[12px] text-gray-400">
                        2024© Chayakorn Phukhiao | information technology
                        branch
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="fixed bottom-3 left-0 z-0 w-full">
            <p className="md:text-md text-center text-xs text-gray-300">
              พัฒนาโดย นายชยากร ภูเขียว นักศึกษาหลักสูตรเทคโนโลยีสารสนเทศ
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
