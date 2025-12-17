# 🩺 Blood Pressure Monitor - Mobile Application

<p align="center">
  <img src="assets/images/icon.png" alt="BP Monitor Logo" width="120" height="120">
</p>

<p align="center">
  <strong>แอปพลิเคชันบันทึกและติดตามความดันโลหิต</strong><br>
  React Native (Expo) | TypeScript | SQLite
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a>
</p>

---

## 📋 Overview

Blood Pressure Monitor เป็นแอปพลิเคชันมือถือสำหรับบันทึกและติดตามค่าความดันโลหิต ออกแบบมาเพื่อช่วยให้ผู้ใช้สามารถ:

- 📝 บันทึกค่าความดันโลหิต (Systolic/Diastolic) และชีพจร
- 📊 ดูกราฟแนวโน้มความดันโลหิตตามช่วงเวลา
- 🔔 ตั้งเตือนการวัดความดันและทานยา
- 📸 ถ่ายรูปหน้าจอเครื่องวัดความดัน
- 🌙 รองรับ Dark Mode

## ✨ Features

### 🏠 Home Screen
- แสดงสรุปค่าความดันโลหิตล่าสุด
- แสดงสถานะความดัน (ปกติ, สูงเล็กน้อย, สูง, วิกฤต)
- Quick stats: ค่าเฉลี่ย, สูงสุด, ต่ำสุด

### ➕ Add Blood Pressure
- กรอกค่า Systolic, Diastolic, Pulse
- เลือกวันที่และเวลาวัด
- เพิ่มบันทึกหมายเหตุ
- แนบรูปภาพจากเครื่องวัด
- Validation ค่าที่กรอก

### 📜 History
- รายการบันทึกความดันโลหิตทั้งหมด
- กรองตามช่วงวันที่
- ค้นหาและ sort ข้อมูล
- ลบ/แก้ไขรายการ

### 📈 Charts & Statistics
- กราฟเส้นแสดงแนวโน้ม Systolic/Diastolic
- กราฟแสดงค่าชีพจร
- เลือกดูตามช่วงเวลา (7 วัน, 30 วัน, 90 วัน)
- สถิติสรุป

### ⚙️ Settings
- ตั้งค่าโปรไฟล์ผู้ใช้
- ตั้งเตือนการวัดความดัน
- ตั้งเตือนทานยา
- เปิด/ปิด Dark Mode
- Export ข้อมูล
- สำรอง/กู้คืนข้อมูล

## 🩸 Blood Pressure Classification

| ระดับ | Systolic (mmHg) | Diastolic (mmHg) | สี |
|-------|-----------------|------------------|-----|
| 🟢 ปกติ | < 120 | < 80 | เขียว |
| 🟡 สูงเล็กน้อย | 120-129 | < 80 | เหลือง |
| 🟠 ความดันสูงระยะ 1 | 130-139 | 80-89 | ส้ม |
| 🔴 ความดันสูงระยะ 2 | 140-179 | 90-119 | แดง |
| 🟣 วิกฤต | ≥ 180 | ≥ 120 | ม่วง |

## 📸 Screenshots

> Screenshots จะถูกเพิ่มเมื่อ UI เสร็จสมบูรณ์

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native (Expo SDK 54) |
| **Language** | TypeScript |
| **Navigation** | Expo Router (File-based routing) |
| **Database** | expo-sqlite (SQLite) |
| **State Management** | React Hooks |
| **Charts** | react-native-chart-kit |
| **Notifications** | expo-notifications |
| **Camera** | expo-camera |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Date Picker** | @react-native-community/datetimepicker |

## 📁 Project Structure

```
BP-Mobile-Application/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout with DB initialization
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home screen
│   │   ├── add.tsx               # Add BP screen
│   │   ├── history.tsx           # History screen
│   │   ├── chart.tsx             # Charts screen
│   │   └── settings.tsx          # Settings screen
│   └── modal.tsx                 # Modal screens
│
├── components/                   # Reusable components
│   ├── bp/                       # Blood pressure components
│   │   ├── bp-card.tsx           # BP record card
│   │   ├── bp-input.tsx          # BP input form
│   │   ├── bp-status-badge.tsx   # Status indicator
│   │   └── bp-summary.tsx        # Summary widget
│   ├── charts/                   # Chart components
│   │   └── bp-line-chart.tsx     # Line chart for BP trends
│   └── ui/                       # UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── screens/                      # Screen components
│   ├── home-screen.tsx
│   ├── add-bp-screen.tsx
│   ├── history-screen.tsx
│   ├── chart-screen.tsx
│   └── settings-screen.tsx
│
├── database/                     # SQLite database layer
│   ├── connection.ts             # Database connection
│   ├── connection.native.ts      # Native SQLite (iOS/Android)
│   ├── connection.web.ts         # Mock DB for web
│   ├── migrations.ts             # Schema migrations
│   └── bp-records.ts             # BP records CRUD
│
├── hooks/                        # Custom React hooks
│   ├── use-bp-records.ts         # BP records operations
│   ├── use-reminders.ts          # Reminder management
│   └── use-color-scheme.ts       # Theme detection
│
├── services/                     # Business logic services
│   ├── notification-service.ts   # Push notifications
│   └── export-service.ts         # Data export
│
├── utils/                        # Utility functions
│   ├── blood-pressure.ts         # BP classification logic
│   └── date-utils.ts             # Date formatting
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All app types
│
├── constants/                    # App constants
│   ├── colors.ts                 # Color palette
│   └── theme.ts                  # Theme configuration
│
└── assets/                       # Static assets
    └── images/                   # App images & icons
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Expo CLI
- iOS Simulator (Mac) / Android Emulator

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vanTHkrab/BP-Mobile-Application.git
   cd BP-Mobile-Application
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm start
   ```

4. **Run on device/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web browser
   - Scan QR code with Expo Go app

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo development server |
| `pnpm ios` | Run on iOS Simulator |
| `pnpm android` | Run on Android Emulator |
| `pnpm web` | Run in web browser |
| `pnpm lint` | Run ESLint |
| `pnpm reset-project` | Reset to blank project |

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | ✅ Supported | iOS 13+ |
| Android | ✅ Supported | Android 6+ |
| Web | ⚠️ Limited | Mock database (localStorage) |

> **Note:** Web version ใช้ mock database ที่เก็บข้อมูลใน localStorage เนื่องจาก SQLite ไม่รองรับ web โดยตรง

## 🗃️ Database Schema

### bp_records
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| systolic | INTEGER | ค่าความดันตัวบน (mmHg) |
| diastolic | INTEGER | ค่าความดันตัวล่าง (mmHg) |
| pulse | INTEGER | ชีพจร (bpm) |
| measured_at | TEXT | วันเวลาที่วัด (ISO 8601) |
| note | TEXT | บันทึกเพิ่มเติม |
| image_path | TEXT | Path รูปภาพ |
| created_at | TEXT | วันที่สร้าง |
| updated_at | TEXT | วันที่แก้ไขล่าสุด |

### reminders
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| type | TEXT | ประเภท (measurement/medication) |
| title | TEXT | ชื่อการแจ้งเตือน |
| time | TEXT | เวลาแจ้งเตือน |
| days | TEXT | วันที่แจ้งเตือน (JSON array) |
| is_enabled | INTEGER | เปิด/ปิดการแจ้งเตือน |

## 🔔 Notifications

แอปรองรับการแจ้งเตือน 3 ประเภท:

1. **Measurement Reminder** - เตือนให้วัดความดันโลหิต
2. **Medication Reminder** - เตือนทานยา
3. **Abnormal Alert** - แจ้งเตือนเมื่อค่าความดันผิดปกติ

## 🎨 Theme Support

รองรับทั้ง Light Mode และ Dark Mode โดยอัตโนมัติตามการตั้งค่าระบบ

| Light Mode | Dark Mode |
|------------|-----------|
| Background: #FFFFFF | Background: #1A1A2E |
| Text: #1A1A2E | Text: #FFFFFF |
| Primary: #6C63FF | Primary: #7C73FF |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**vanTHkrab**
- GitHub: [@vanTHkrab](https://github.com/vanTHkrab)

---

<p align="center">
  Made with ❤️ using React Native & Expo
</p>
# BP-Mobile-Application
