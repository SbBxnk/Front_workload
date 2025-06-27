"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import Image from "next/image"
import RMUTL_logo1 from "../../../public/images/rmutl_1_logo.png"
import Swal from "sweetalert2"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Link from "next/link"
import Cookies from "js-cookie"
interface UserLogin {
  u_email: string
  u_pass: string
}

interface DecodedToken {
  level_name: string
  id: number
}

export default function Login() {
  // Comment out these CAPTCHA-related states and refs at the top of the component
  // const [captcha, setCaptcha] = useState("")
  // const [userCaptcha, setUserCaptcha] = useState("")
  // const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  //
  const [, setJsonData] = useState({ u_email: "", u_pass: "" })
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const savedEmail = Cookies.get("rememberedEmail")
    const savedPassword = Cookies.get("rememberedPassword")
    if (savedEmail) {
      setEmail(savedEmail)
      setJsonData((prev) => ({ ...prev, u_email: savedEmail }))
      setRememberMe(true)
    }
    if (savedPassword) {
      setPassword(savedPassword)
      setJsonData((prev) => ({ ...prev, u_pass: savedPassword }))
    }
  }, [])

  // Modify the handleLogin function to bypass the CAPTCHA verification
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = data.get("email") as string
    const password = data.get("password") as string

    const JsonData: UserLogin = {
      u_email: email,
      u_pass: password,
    }

    // Save email and password in cookies if remember me is checked
    if (rememberMe) {
      // Only set cookies if they don't already exist or have changed
      const currentEmailCookie = Cookies.get("rememberedEmail")
      const currentPasswordCookie = Cookies.get("rememberedPassword")

      if (currentEmailCookie !== email) {
        Cookies.set("rememberedEmail", email, { expires: 30 }) // expires in 30 days
      }
      if (currentPasswordCookie !== password) {
        Cookies.set("rememberedPassword", password, { expires: 30 }) // expires in 30 days
      }
    } else {
      // If remember me is unchecked, ensure cookies are removed
      Cookies.remove("rememberedEmail")
      Cookies.remove("rememberedPassword")
    }

    setJsonData(JsonData)

    // Comment out the modal dialog
    // ; (document.getElementById("my_modal_3") as HTMLDialogElement)?.showModal()

    // Add direct login attempt without CAPTCHA
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
        text: "กรุณาลองใหม่อีกครั้ง",
      })
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
        className="absolute w-full h-full bg-no-repeat bg-fixed bg-left"
        style={{
          backgroundImage: "url('/images/business_dept.png')",
          backgroundSize: "cover",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          width: "100%",
          zIndex: 0,
          opacity: "0.4",
        }}
      ></div>
      <div
        className="absolute w-full h-full bg-no-repeat bg-cover bg-fixed bg-center "
        style={{
          backgroundImage: "url('/images/layered-waves-haikei.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          zIndex: 0,
        }}
      ></div>
      <div className="container relative">
        <div className="flex justify-center items-center lg:grid lg:place-items-center h-screen">
          <div className="flex items-center justify-between flex-col-reverse lg:flex-row w-full p-0 md:my-0 md:pb-4 gap-20">
            <div className="w-full h-full hidden lg:block ">
              <div className="gird place-items-center h-[400px]">
                <div className="w-[500px]">
                  <h1 className="text-business1 font-medium lg:text-[38px] text-start text-nowrap pr-4">
                    เว็บแอปพลิเคชันสำหรับบุคลากร
                  </h1>
                  <div className="flex justify-between mt-6">
                    <Image
                      src={RMUTL_logo1 || "/placeholder.svg"}
                      alt="RMUTL"
                      width={100}
                      className="pr-4 w-[100px] h-[100px]"
                    />
                    <div className="">
                      <h3 className="text-5xl text-gray-600 font-medium">SEWAP-RMUTLL</h3>
                      <h3 className="text-md text-gray-500 pr-4">
                        Support System for Evaluating the Workload of Academic Personnel at RMUTL Web Application
                      </h3>
                    </div>
                  </div>
                  <h1 className="text-md text-gray-400 mt-2 pr-4">
                    แอปพลิเคชันสำหรับบุคลากรในมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา ลำปาง เพื่อเข้าใช้งานในการประเมินภาระงานที่
                  </h1>
                </div>
              </div>
            </div>
            <div className="w-full h-full z-10">
              <div className="grid place-items-center">
                <div className="card bg-white md:bg-white/80 backdrop-blur-3xl p-4 md:p-8 drop-shadow-[0px_0px_5px_rgba(0,0,0,0.09)]  border-2 border-gray-200 md:w-[420px] w-full">
                  <div className="space-y-4">
                    <div className="">
                      <h1 className="text-gray-600 text-xl md:text-2xl text-start font-medium">
                        ระบบสนับสนุนการประเมินภาระงานบุคลากรสายวิชาการ
                      </h1>
                      <h4 className="text-gray-500 text-sm md:text-md text-start">
                        มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา ลำปาง
                      </h4>
                    </div>
                    <h1 className="text-business1 text-xl md:text-2xl text-start font-medium">
                      สำหรับบุคลากรคณะบริหารธุรกิจ
                    </h1>
                    <form onSubmit={handleLogin} className="flex flex-col gap-2">
                      <div className="space-y-2">
                        <label className="block text-gray-500 text-md font-medium">RMUTL E-mail</label>
                        <input
                          className="text-md font-light w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm transition duration-300 ease-in-out transform focus:outline-blue-300 hover:border-blue-300 "
                          placeholder="exmaple@live.rmutl.ac.th"
                          type="text"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-gray-500 text-md font-medium">รหัสผ่าน</label>
                        <input
                          className="text-md font-light w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm transition duration-300 ease-in-out transform focus:outline-blue-300 hover:border-blue-300 "
                          placeholder="รหัสผ่าน"
                          type="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <label className="text-md font-light flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-5 w-5 text-blue-500 !border !border-gray-300 !rounded-md focus:ring-blue-500 cursor-pointer"
                              checked={rememberMe}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setRememberMe(isChecked)
                                if (isChecked && email && password) {
                                  Cookies.set("rememberedEmail", email, { expires: 30 })
                                  Cookies.set("rememberedPassword", password, { expires: 30 })
                                } else if (!isChecked) {
                                  Cookies.remove("rememberedEmail")
                                  Cookies.remove("rememberedPassword")
                                }
                              }}
                            />
                            <span className="text-gray-500 font-light text-md">จดจำฉัน</span>
                          </label>
                          <Link href="#" className="float-end text-gray-400 hover:underline text-md font-light">
                            ลืมรหัสผ่าน
                          </Link>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 mt-2 bg-business1 rounded-md w-full text-center text-md  font-light text-white hover:bg-blue-900"
                      >
                        เข้าสู่ระบบ
                      </button>
                      <div className="divider m-0">
                        <p className="text-center text-gray-400 text-sm">หมายเหตุ</p>
                      </div>
                      <p className="text-sm text-center text-gray-500">
                        กรณีพบปัญหาการเข้าใช้งาน หรือมีข้อสงสัย{" "}
                        <span className="text-business1 underline">
                          <a href="https://www.rmutl.ac.th/" target="_blank" rel="noreferrer">
                            ติดต่อได้ที่นี่
                          </a>
                        </span>
                      </p>
                      <p className="text-[12px] text-center text-gray-400">
                        2024© Chayakorn Phukhiao | information technology branch
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
          <footer className="fixed bottom-3 w-full left-0 z-0">
            <p className="text-center text-gray-300 text-xs md:text-md">
              พัฒนาโดย นายชยากร ภูเขียว นักศึกษาหลักสูตรเทคโนโลยีสารสนเทศ
            </p>
          </footer>
        </div>
      </div>
    </>
  )
  
}
