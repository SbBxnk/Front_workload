"use client";
import React from "react";
import Image from "next/image";
import SignupImg from "../../../public/signup.webp";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { LuClipboardSignature } from "react-icons/lu";
import { IoIosMail } from "react-icons/io";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

interface UserRegister {
  fname: string;
  lname: string;
  email: string;
  password: string;
}

const userSchema = Yup.object().shape({
  fname: Yup.string()
    .required("Firstname is required")
    .min(2, "Firstname must be at least 2 characters long"),
  lname: Yup.string()
    .required("Lastname is required")
    .min(2, "Lastname must be at least 2 characters long"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
});

export default function register() {
  return (
    <div className="container">
      <div className="flex items-center justify-between flex-col-reverse lg:flex-row w-full p-0 lg:p-10 md:p-10 m-0 my-10">
        <div className="w-full h-full">
          <div className="gird place-items-center">
            <div className="hidden lg:block">
              <Image
                src={SignupImg}
                alt="Login Image"
                width={600}
                height={600}
                priority={false}
              ></Image>
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          <div className="grid place-items-center">
            <div className="card bg-base-100 p-5 shadow-xl border-2 border-gray-200 lg:w-[380px] md:w-[380px] w-full">
              <h1 className="text-gray-600 text-2xl text-center my-10 mx-3">
                Sign Up Page
              </h1>
              <h4 className="text-gray-600 text-md text-center my-5 mx-3">
                Create account Lorem ipsum dolor sit amet.
              </h4>
              <Formik<UserRegister>
                initialValues={{
                  fname: "",
                  lname: "",
                  email: "",
                  password: "",
                }}
                validationSchema={userSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  fetch(process.env.NEXT_PUBLIC_API + "register", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.status === "ok") {
                        Swal.fire({
                          icon: "success",
                          title: "Sign Up Successful!",
                          showConfirmButton: false,
                          timer: 1500,
                        }).then(() => {
                          window.location.href = "../main/register";
                          resetForm();
                          setSubmitting(false);
                        });
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: "Sign Up Failed!",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                        setSubmitting(false);
                      }
                    })
                    .catch((error) => {
                      console.error("Registration failed:", error);
                      Swal.fire({
                        icon: "error",
                        title: "An Error Occurred",
                        text: "Please try again later.",
                        showConfirmButton: false,
                      });
                      setSubmitting(false);
                    });
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="flex flex-col gap-4 mb-[30px]">
                    <div className="flex flex-row gap-2">
                      <div className="w-1/2">
                        <label className=" input input-bordered flex items-center gap-2">
                          <LuClipboardSignature className="h-4 w-4 opacity-70" />
                          <Field
                            type="text"
                            className="grow w-1/2"
                            name="fname"
                            placeholder="Enter Firstname"
                            required
                          />
                        </label>
                        <ErrorMessage
                          name="fname"
                          component="div"
                          className="flex justify-end text-sm text-red-600 m-0 p-0"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className=" input input-bordered flex items-center gap-2">
                          <LuClipboardSignature className="h-4 w-4 opacity-70" />
                          <Field
                            type="text"
                            className="grow w-1/2"
                            name="lname"
                            placeholder="Enter Lastname"
                            required
                          />
                        </label>
                        <ErrorMessage
                          name="lname"
                          component="div"
                          className="flex justify-end text-sm text-red-600 m-0 p-0"
                        />
                      </div>
                    </div>
                    <div className="">
                      <label className="input input-bordered flex items-center gap-2">
                        <IoIosMail className="h-4 w-4 opacity-70" />
                        <Field
                          type="text"
                          className="grow"
                          name="email"
                          placeholder="Enter Email"
                          required
                        />
                      </label>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="flex justify-end text-sm text-red-600 m-0 p-0"
                      />
                    </div>
                    <div className="">
                      <label className="input input-bordered flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-4 w-4 opacity-70"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <Field
                          type="text"
                          className="grow"
                          name="password"
                          placeholder="Enter Password"
                          required
                        />
                      </label>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="flex justify-end text-sm text-red-600 m-0 p-0"
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-sm btn-warning rounded-full w-1/2 px-1 text-center text-white transition ease-in-out hover:scale-110 duration-300"
                      >
                        Sign up
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="flex justify-start w-full">
                <Link
                  href={"../main/login"}
                  className="flex justify-center items-center gap-1 text-gray-400 text-sm "
                >
                  <FaArrowLeft /> <span>Back to Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
