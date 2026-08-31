# 🚗 RideNow - Movilidad Universitaria Compartida

**RideNow** es una Progressive Web App (PWA) diseñada para conectar estudiantes y conductores universitarios en Pereira, facilitando viajes compartidos seguros, económicos y en tiempo real.

---

## 🌟 Características Principales

- 🔐 **Autenticación con Supabase:** Registro e inicio de sesión seguros en la nube.
- 🎓 **Perfiles Universitarios:** Configurado especialmente para la comunidad de **Areandina**, **UTP**, **Universidad Libre**, **UCP**, **UNAD**, etc.
- 🚗 **Panel de Conductor:** Registro de vehículos (marca, modelo, placa, color, asientos), publicación de rutas y gestión de solicitudes (Aceptar / Rechazar).
- 🎒 **Panel de Estudiante:** Búsqueda en tiempo real por horario, precio y asientos disponibles, cálculo de tarifa y selección de método de pago (Efectivo, Nequi, Bancolombia).
- 📍 **Seguimiento y Calificaciones:** Progreso visual del viaje y sistema de reseñas/estrellas con base de datos en Supabase.
- 📱 **PWA & Responsive:** Accesible desde cualquier dispositivo (PC, Android, iOS) e instalable como app nativa.

---

## 🛠️ Tecnologías

- **Frontend:** React + Vite + Lucide Icons + PWA Plugin
- **Backend / Base de Datos:** [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth, Row Level Security)
- **Estilos:** CSS Modular & Glassmorphism

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JuanjoG11/ridenow.git
   cd ridenow
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceso desde otros dispositivos en tu red Wi-Fi:**
   ```bash
   npm run dev -- --host
   ```
