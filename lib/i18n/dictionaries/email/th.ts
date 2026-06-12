import type { EmailDictionary } from "@/lib/i18n/email-types";

const email: EmailDictionary = {
  subjectPrefix: "[FLASH]",
  footerNotice: "การแจ้งเตือน FLASH · กรุณาอย่าตอบกลับอีเมลนี้",
  actionClient: "ดูความคืบหน้าการจอง",
  actionStudio: "เปิดแดชบอร์ด",
  verification: {
    clientTitle: "กรุณายืนยันบัญชีลูกค้าของคุณ",
    studioTitle: "กรุณายืนยันบัญชีสตูดิโอของคุณ",
    clientBody:
      "คลิกปุ่มด้านล่างเพื่อยืนยัน Email หลังจากนั้นคุณจะสามารถส่งคำขอจองและรับการแจ้งเตือนได้",
    studioBody:
      "คลิกปุ่มด้านล่างเพื่อยืนยัน Email หลังจากนั้นคุณจะสามารถรับการแจ้งเตือนเกี่ยวกับการจองได้",
    buttonLabel: "ยืนยัน Email",
    linkFallback: "หากปุ่มใช้งานไม่ได้ กรุณาคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:",
    systemFooter: "ระบบจอง FLASH · กรุณาอย่าตอบกลับอีเมลนี้",
  },
  newIntake: {
    title: "ได้รับคำขอจองใหม่",
    body: "{clientName} ส่งคำขอจอง ({projectId}) แล้ว เปิดแดชบอร์ดเพื่อดูสรุป FLASH และเริ่มเสนอราคา",
  },
  discussionClientMessage: {
    title: "มีข้อความใหม่ในการจอง",
    body: '{authorLabel} ทิ้งข้อความใน {projectId}:\n"{preview}"',
  },
  discussionStudioReply: {
    title: "สตูดิโอตอบข้อความของคุณแล้ว",
    body: '{studioName} ตอบในการจอง {projectId}:\n"{preview}"',
  },
  quoteSessionHint:
    " (ใบเสนอราคาครั้งที่ {sessionIndex} จาก {totalSessions} ครั้ง · แต่ละครั้งคิดราคาแยกกัน)",
  quoteFirstSend: {
    title: "ส่งใบเสนอราคาและช่วงเวลาแล้ว",
    body: "{studioName} ส่งใบเสนอราคาและช่วงเวลาที่จองได้{sessionHint} แล้ว กรุณาเข้าสู่ระบบเพื่อตรวจสอบและยืนยัน",
  },
  quoteUpdatedBoth: {
    title: "อัปเดตใบเสนอราคาและช่วงเวลาแล้ว",
    body: "{studioName} อัปเดตใบเสนอราคาและช่วงเวลาที่จองได้{sessionHint} แล้ว กรุณาเข้าสู่ระบบเพื่อตรวจสอบและยืนยัน",
  },
  quoteSlotsUpdated: {
    title: "อัปเดตช่วงเวลาที่จองได้แล้ว",
    body: "{studioName} อัปเดตช่วงเวลาที่จองได้{sessionHint} แล้ว กรุณาเข้าสู่ระบบเพื่อเลือกช่วงเวลา",
  },
  quotePriceUpdated: {
    title: "อัปเดตใบเสนอราคาแล้ว",
    body: "{studioName} อัปเดตใบเสนอราคา{sessionHint} แล้ว กรุณาเข้าสู่ระบบเพื่อตรวจสอบ",
  },
  slotReservedClient: {
    title: "จองช่วงเวลาแล้ว — กรุณาโอนเงินมัดจำ",
    body: "คุณเลือก: {slotLabel}.\nกรุณาโอนเงินมัดจำก่อน {deadlineLabel} หากเกินกำหนด การจองจะถูกยกเลิกโดยอัตโนมัติ",
  },
  slotReservedStudio: {
    title: "ลูกค้าเลือกช่วงเวลาแล้ว",
    body: "{clientName} เลือก {slotLabel} กำหนดชำระมัดจำ: {deadlineLabel}",
  },
  depositExpiredClient: {
    title: "ยกเลิกการจองเนื่องจากมัดจำเกินกำหนด",
    body: "การจอง {projectId} ถูกยกเลิกเนื่องจากไม่ได้รับมัดจำภายในกำหนด ช่วงเวลาที่จองไว้ถูกปล่อยแล้ว กรุณาเลือกช่วงเวลาใหม่",
  },
  depositExpiredStudio: {
    title: "มัดจำเกินกำหนด — ยกเลิกการจอง",
    body: "การจอง {projectId} ถูกยกเลิกเนื่องจากลูกค้าไม่ได้ชำระมัดจำภายในกำหนด ช่วงเวลาถูกปล่อยแล้ว",
  },
  depositSubmitted: {
    title: "ลูกค้าอัปโหลดหลักฐานมัดจำแล้ว",
    body: "{clientName} ยืนยันช่วงเวลาและอัปโหลดหลักฐานมัดจำ ({projectId}) แล้ว กรุณาตรวจสอบในแดชบอร์ด",
  },
  sketchesUploaded: {
    title: "สตูดิโออัปโหลดแบบร่างแล้ว",
    body: "{studioName} อัปโหลดแบบร่าง{countHint} สำหรับการจอง {projectId} แล้ว กรุณาเข้าสู่ระบบเพื่อตรวจสอบและยืนยัน",
  },
  finalPhotosUploaded: {
    title: "สตูดิโออัปโหลดภาพผลงานแล้ว",
    body: "{studioName} อัปโหลดภาพผลงานรอยสัก{countHint} (การจอง {projectId}) แล้ว ดูได้ที่หน้าการจองของคุณ",
  },
  projectCompleted: {
    title: "การจองเสร็จสมบูรณ์",
    body: "{studioName} ทำเครื่องหมายการจอง {projectId} ว่าเสร็จสมบูรณ์แล้ว ดูภาพผลงานและคำแนะนำการดูแลหลังสักได้ที่หน้าการจอง",
  },
  depositConfirmedSingle: {
    title: "ยืนยันการจองแล้ว",
    body: "{studioName} ยืนยันมัดจำของคุณแล้ว การจอง ({projectId}) ของคุณได้รับการยืนยันแล้ว",
  },
  depositConfirmedMulti: {
    title: "ยืนยันการจองรอบนี้แล้ว",
    body: "{studioName} ยืนยันมัดจำรอบที่ {sessionIndex} แล้ว การจองของคุณได้รับการยืนยัน กรุณามาตรงเวลา สตูดิโอจะแชร์แบบร่างก่อนสัก อัปโหลดภาพผลงานหลังเสร็จ แล้วจึงนัดรอบถัดไป",
  },
  nextSessionReadyMulti: {
    title: "พร้อมนัดรอบถัดไป",
    body: "{studioName} ส่งมอบงานรอบที่ {previousSession} เสร็จแล้ว เราจะแจ้งเมื่อใบเสนอราคาและช่วงเวลาของรอบที่ {sessionIndex} พร้อม",
  },
  nextSessionReadySingle: {
    title: "พร้อมนัดรอบถัดไป",
    body: "{studioName} ส่งมอบงานเสร็จแล้ว เราจะแจ้งเมื่อใบเสนอราคาและช่วงเวลาพร้อม",
  },
  preSessionSignedStudio: {
    title: "ลูกค้าเซ็นเอกสารก่อนสักแล้ว",
    body: '{clientName} เซ็น "{documentTitle}" ออนไลน์ (การจอง {projectId}) แล้ว ดูไฟล์ที่เก็บไว้ในแดชบอร์ด',
  },
  preSessionArchivedClient: {
    title: "เก็บเอกสารก่อนสักแล้ว",
    body: '{studioName} อัปโหลดและเก็บ "{documentTitle}" (การจอง {projectId}) ของคุณแล้ว ดูได้ที่หน้าการจอง',
  },
  countHint: " ({count} ไฟล์)",
};

export default email;
