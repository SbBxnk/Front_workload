'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import RMUTL_logo1 from '../../../public/images/rmutl_1_logo.png'
import Swal from 'sweetalert2'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useSession, signIn } from 'next-auth/react'
import AuthService from '@/services/authService'
import { Eye, EyeOff } from 'lucide-react'
export default function Login() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    console.log('Login page - Status:', status, 'Session:', session)

    // Load remembered credentials
    const savedEmail = Cookies.get('rememberedEmail')
    const savedPassword = Cookies.get('rememberedPassword')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    if (savedPassword) {
      setPassword(savedPassword)
    }
  }, [status, session, router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Handle remember me functionality
    if (rememberMe) {
      Cookies.set('rememberedEmail', email, { expires: 30 })
      Cookies.set('rememberedPassword', password, { expires: 30 })
    } else {
      Cookies.remove('rememberedEmail')
      Cookies.remove('rememberedPassword')
    }

    try {
      // Use NextAuth signIn without redirect
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          showConfirmButton: false,
          timer: 1000,
        }).then(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          router.push('/auth/redirect')
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: result?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'กรุณาลองใหม่อีกครั้ง',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Comment out these CAPTCHA-related functions
  /*
    const handleConfirmCaptcha = async () => {
        if (userCaptcha === captcha) {
            try {
                const response = await axios.post(process.env.NEXT_PUBLIC_API + "/login", JsonData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                const data = response.data

                if (data.status === "ok") {
                    Swal.fire({
                        icon: "success",
                        title: "เข้าสู่ระบบสำเร็จ!",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then(() => {
                        localStorage.setItem("token", data.token)
                        const decodedToken: DecodedToken = jwtDecode(data.token)
                        if (decodedToken.level_name === "ผู้ใช้งานทั่วไป") {
                            redirect(`/user/`)
                        } else if (decodedToken.level_name === "ผู้ดูแลระบบ") {
                            redirect("/admin/")
                        } else if (decodedToken.level_name === "ผู้ประเมินภาระงาน") {
                            redirect("/assessor/")
                        } else if (decodedToken.level_name === "เลขาณุการ") {
                            redirect("/secretary/")
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "ระดับผู้ใช้งานไม่ถูกต้อง",
                                text: "กรุณาติดต่อผู้ดูแลระบบ",
                                showConfirmButton: true,
                            })
                        }
                    })
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "เข้าสู่ระบบไม่สำเร็จ",
                        text: data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
                    })
                }
            } catch {
                Swal.fire({
                    icon: "error",
                    title: "รหัสผ่านไม่ถูกต้อง",
                    text: "กรุณาลองใหม่อีกครั้ง"
                })
            }
            const modal = document.getElementById("my_modal_3") as HTMLDialogElement
            modal?.close()
        } else {
            const modal = document.getElementById("my_modal_3") as HTMLDialogElement
            modal?.close()
            Swal.fire({
                icon: "error",
                title: "Captcha ไม่ถูกต้อง",
                text: "กรุณากรอก Captcha ให้ถูกต้อง",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                generateCaptcha()
                setUserCaptcha("")
                inputRefs.current.forEach((input) => {
                    if (input) {
                        input.value = ""
                    }
                })
                modal?.showModal()
            })
        }
    }

    const generateCaptcha = () => {
        const chars = "0123456789"
        let captcha = ""
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setCaptcha(captcha)
    }

    React.useEffect(() => {
        generateCaptcha()
    }, [])

    const handlePinChange = (
        e: React.KeyboardEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
        idx: number,
    ) => {
        const target = e.target as HTMLInputElement
        const value = target.value
        if (e.type === "change" && /^\d$/.test(value)) {
            if (idx < inputRefs.current.length - 1) {
                inputRefs.current[idx + 1]?.focus()
            }
        } else if (e.type === "keydown" && (e as React.KeyboardEvent<HTMLInputElement>).key === "Backspace") {
            target.value = ""
            if (idx > 0) {
                inputRefs.current[idx - 1]?.focus()
            }
        } else if (e.type === "keydown" && (e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
            e.preventDefault()
            const allFilled = inputRefs.current.every((input) => input && input.value !== "")
            if (allFilled) {
                handleConfirmCaptcha()
            } else {
                const nextEmptyField = inputRefs.current.find((input) => input && input.value === "")
                nextEmptyField?.focus()
            }
        } else {
            target.value = ""
        }
        setUserCaptcha((prevCaptcha) => prevCaptcha.slice(0, idx) + value + prevCaptcha.slice(idx + 1))
    }
    */

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
                    <div className="">
                      <h1 className="text-start text-xl font-medium text-gray-600 md:text-2xl">
                        ระบบสนับสนุนการประเมินภาระงานบุคลากรสายวิชาการ
                      </h1>
                      <h4 className="md:text-md text-start text-sm text-gray-500">
                        มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา ลำปาง
                      </h4>
                    </div>
                    <h1 className="text-start text-xl font-medium text-business1 md:text-2xl">
                      สำหรับบุคลากรคณะบริหารธุรกิจ
                    </h1>
                    <form
                      onSubmit={handleLogin}
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
                      <div className="space-y-2">
                        <label className="text-md block font-medium text-gray-500">
                          รหัสผ่าน
                        </label>
                        <div className="relative">
                          <input
                            className="text-md w-full transform rounded-md border border-gray-300 px-4 py-2 pr-10 font-light shadow-sm transition duration-300 ease-in-out hover:border-blue-300 focus:outline-blue-300"
                            placeholder="รหัสผ่าน"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-md flex cursor-pointer items-center gap-2 font-light">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer !rounded-md !border !border-gray-300 text-blue-500 focus:ring-blue-500"
                              checked={rememberMe}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setRememberMe(isChecked)
                                if (isChecked && email && password) {
                                  Cookies.set('rememberedEmail', email, {
                                    expires: 30,
                                  })
                                  Cookies.set('rememberedPassword', password, {
                                    expires: 30,
                                  })
                                } else if (!isChecked) {
                                  Cookies.remove('rememberedEmail')
                                  Cookies.remove('rememberedPassword')
                                }
                              }}
                            />
                            <span className="text-md font-light text-gray-500">
                              จดจำฉัน
                            </span>
                          </label>
                          <Link
                            href="/forgot-password"
                            className="text-md float-end font-light text-gray-400 hover:underline"
                          >
                            ลืมรหัสผ่าน
                          </Link>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="text-md mt-2 w-full rounded-md bg-business1 px-4 py-2 text-center font-light text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
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

            {/* <dialog id="my_modal_3" className="modal">
                            <div className="modal-box p-4">
                                <form method="dialog">
                                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                </form>
                                <div className="bg-white p-4 rounded-md space-y-4">
                                    <div className="flex justify-center items-center w-full gap-4">
                                        <p className="text-center text-5xl text-gray-600 w-1/2">{captcha}</p>
                                    </div>
                                    <div className="flex md:gap-4 gap-2 justify-center">
                                        {Array(6)
                                            .fill(null)
                                            .map((_, idx) => (
                                                <input
                                                    id="captchaForm"
                                                    key={idx}
                                                    type="text"
                                                    maxLength={1}
                                                    pattern="\d*"
                                                    className="w-10 text-gray-500 font-light h-10 md:w-14 md:h-14 text-center border border-gray-300 rounded-md text-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                                                    onChange={(e) => handlePinChange(e, idx)}
                                                    onKeyDown={(e) => handlePinChange(e, idx)}
                                                    ref={(el) => {
                                                        inputRefs.current[idx] = el
                                                    }}
                                                />
                                            ))}
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-lg font-light text-white rounded-md bg-business1 hover:bg-business1/90 focus:outline-none"
                                            onClick={handleConfirmCaptcha}
                                        >
                                            ยืนยัน
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </dialog> */}
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
