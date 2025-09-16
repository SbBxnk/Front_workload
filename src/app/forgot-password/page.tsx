'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import Swal from 'sweetalert2'
import Image from 'next/image'
import RMUTL_logo1 from '../../../public/images/rmutl_1_logo.png'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ u_email: email })
      })
      
      const data = await response.json()

      if (data.status) {
        Swal.fire({
          icon: 'success',
          title: 'ส่งอีเมลสำเร็จ!',
          text: data.message,
          showConfirmButton: false,
          timer: 3000,
        })
        setEmail('')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: data.message,
          showConfirmButton: false,
          timer: 3000,
        })
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
                        <Mail className="h-10 w-10 text-business1" />
                      </div>
                      <p className="m-0 text-center text-xl font-medium text-business1 md:text-3xl">
                        ลืมรหัสผ่าน
                      </p>
                      <p className="text-md m-0 text-center font-light text-gray-500">
                        (กรอก RMUTL email
                        ของคุณเพื่อที่ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ)
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-2"
                    >
                      <div className="space-y-2">
                        <label className="text-md block font-medium text-gray-500">
                          RMUTL E-mail
                        </label>
                        <input
                          className="text-md w-full transform rounded-md border border-gray-300 px-4 py-2 font-light shadow-sm transition duration-300 ease-in-out hover:border-blue-300 focus:outline-blue-300"
                          placeholder="exmaple@live.rmutl.ac.th"
                          type="text"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="text-md mt-2 w-full rounded-md bg-business1 px-4 py-2 text-center font-light text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? 'กำลังส่งลิ้ง...' : 'ส่งลิ้งอีเมล'}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        disabled={loading}
                        className="text-md mt-2 w-full rounded-md bg-gray-500 px-4 py-2 text-center font-light text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                       ย้อนกลับ
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
