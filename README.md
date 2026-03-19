<div align="center">
  <img src="public/logo-square.png" alt="PastoSETP Logo" width="120" style="border-radius:20%"/>
  <h1>PastoSETP</h1>
  <p><strong>Plataforma integral de movilidad inteligente y atención al ciudadano para Pasto, Nariño.</strong></p>
</div>

<br/>

## 📖 Sobre el Proyecto

**PastoSETP** es una solución tecnológica diseñada para transformar la gestión operativa y la experiencia ciudadana del ecosistema de transporte público en San Juan de Pasto. Su objetivo principal es conectar a la ciudadanía con datos de rutas y herramientas interactivas, empleando inteligencia artificial y altos estándares de diseño UI/UX.

La plataforma cuenta con un módulo público orientado al ciudadano, que facilita la búsqueda de rutas, seguimiento gráfico de trayectos y un sistema asistido de PQRS (Peticiones, Quejas, Reclamos y Sugerencias). Además, integra un módulo administrativo exclusivo para la gestión interna de flotas vehiculares (buses, conductores y trazado de rutas), garantizando seguridad y eficiencia corporativa.

### 🛠️ Tecnologías Principales

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Backend & Autenticación:** Supabase (PostgreSQL, RLS).
- **Inteligencia Artificial:** Google Gemini AI (Módulo estructurador de PQRS y búsqueda).

---

## 🚀 Instalación y Configuración Local

A continuación, se detallan los pasos para configurar y desplegar el proyecto en tu entorno de desarrollo.

### 1. Pre-requisitos
Asegúrate de tener instalado:
- Node.js (v18.0 o superior)
- NPM o Yarn

### 2. Clonar el repositorio
Abre tu terminal y ejecuta los siguientes comandos para obtener una copia local del proyecto:

```bash
git clone https://github.com/Angie11P/pastosetp.git
cd pastosetp
```

### 3. Instalar dependencias
Instala los paquetes necesarios del ecosistema Node con el siguiente comando:

```bash
npm install
```


### 4. Iniciar la aplicación
Inicializa el servidor de desarrollo en caliente de Vite:

```bash
npm run dev
```

La plataforma estará disponible inmediatamente, por defecto en `http://localhost:3000`. 
*(Para ingresar a las funciones del administrador interno, la ruta es `/admin/login`).*

---
<div align="center">
  <p><i>© PastoSETP - Innovación tecnológica para la movilidad pública.</i></p>
</div>
