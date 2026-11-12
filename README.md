# FF RANDOM — Free Fire Randomizer (No-API / Static Edition)

เว็บไซต์สุ่มตัวละคร ปืน สกินปืน และสัตว์เลี้ยงเกม Free Fire ด้วย HTML, CSS และ Vanilla JavaScript ล้วน **ไม่ต้องใช้ API Key และไม่ต้องรัน Node.js Server**

## โครงสร้างไฟล์ (6 ไฟล์)
- `index.html` — หน้าเว็บหลัก
- `style.css` — ธีม Gaming Dark ดำ/แดง/ทอง
- `app.js` — ระบบโหลดข้อมูลจาก JSON ในเครื่อง, สุ่มไม่ซ้ำ, กรองระดับความหายาก และเก็บประวัติใน LocalStorage
- `data/fallback.json` — ฐานข้อมูลไอเทมครบ 4 หมวด (154 รายการ) พร้อมชื่อไทย-อังกฤษและ Item ID
- `assets/placeholder.svg` — ภาพสำรองเมื่อไม่มีรูป

## วิธีเปิดใช้งานใน VS Code
1. แตกไฟล์ ZIP ออกเป็นโฟลเดอร์ `ff-randomizer-local`
2. เปิดโฟลเดอร์ใน **VS Code**
3. คลิกขวาที่ไฟล์ **`index.html`** แล้วเลือก **Open with Live Server** (หรือกดปุ่ม `Go Live` มุมขวาล่าง)
4. ใช้งานได้ทันที!

## วิธีเพิ่มหรือเปลี่ยนรูปภาพเอง
เปิดไฟล์ `data/fallback.json` แล้วใส่ลิงก์รูปภาพ หรือ path รูปในโฟลเดอร์ `assets/` ลงในช่อง `"image_url"` ของรายการที่ต้องการ เช่น:
```json
{
  "itemID": "101000023",
  "name": "Alok (ดีเจ อล็อก)",
  "type": "Characters",
  "rarity": "LEGENDARY",
  "image_url": "assets/alok.png"
}
```
