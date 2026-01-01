import React from 'react'

function Definitions() {
  return (
    <div>
      <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
        คำจำกัดความ
      </p>
      
      <div className="w-full">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="text-sm font-light text-gray-800 dark:text-gray-200 mt-0.5">-</span>
            <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
              <span className="font-semibold">ภาระงานหลัก</span> คือ งานที่ต้องรับผิดชอบตามตำแหน่งหน้าที่หรืองานที่ผู้บังคับบัญชาได้กำหนดให้เป็นภาระงาน
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-sm font-light text-gray-800 dark:text-gray-200 mt-0.5">-</span>
            <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
              <span className="font-semibold">ภาระงานบริหาร</span> คือ การปฏิบัติงานที่ครอบคลุมถึงการมอบหมาย วินิจฉัย สั่งการ ควบคุม ตรวจสอบ ให้คำปรึกษาแนะนำปรับปรุงแก้ไข ติดตาม
              ประเมินผลและแก้ปัญหาขัดข้องในหน่วยงานที่รับผิดชอบให้เกิดความถูกต้อง เรียบร้อย สมบูรณ์ และทันเหตุการณ์ ทั้งนี้รวมถึงงานวางแผนประจำ
              งานแผนกลยุทธ์ งานการประชุม
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-sm font-light text-gray-800 dark:text-gray-200 mt-0.5">-</span>
            <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
              <span className="font-semibold">ภาระงานเชิงพัฒนา/บริการวิชาการ</span> คือ การปฏิบัติงานโครงการ กิจกรรมที่มีการคิดค้น แก้ปัญหา ปรับปรุงและพัฒนาหรือสร้างนวัตกรรม
              ระบบงาน อาทิ การจัดทำคู่มือการปฏิบัติงาน มาตรฐานการทำงาน การลดขั้นตอนการทำงานรวมถึงการค้นคว้า วิเคราะห์ วิจัยเพื่อพัฒนางานใหม่
            </p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-sm font-light text-gray-800 dark:text-gray-200 mt-0.5">-</span>
            <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
              <span className="font-semibold">ภาระงานที่ได้รับมอบหมาย</span> คือ การปฏิบัติงานตามที่ได้รับมอบหมายอื่น ๆ เช่น หน้าที่ที่ได้รับมอบหมายจากผู้บังคับบัญชานอกเหนือจากภาระ
              งานหลัก การเป็นกรรมการ หรือคณะทำงานเพื่อพัฒนางานส่วนรวมของหน่วยงานหรือมหาวิทยาลัย
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Definitions

