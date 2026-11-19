// عنوان الـ Backend — بيتقرا من متغير البيئة VITE_API_URL
//  - محلي:   VITE_API_URL=http://localhost:5000   (في ملف Frontend/.env)
//  - Vercel: VITE_API_URL=https://your-app.onrender.com  (من Environment Variables)
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// نشيل أي "/" في الآخر عشان منقعش في "//api"
export const API_URL = rawUrl.replace(/\/+$/, "");

// كل الـ endpoints بتبدأ من هنا: `${API}/movies`
export const API = `${API_URL}/api`;
