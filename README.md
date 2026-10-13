# test-manager-library-3145556-app

> **Prueba técnica · Ficha ADSO 3145556**
> Entrega: **martes 13 de octubre de 2026, a las 5:00 p. m.** (17:00, hora Colombia).

Este repositorio es el **frontend** de *Manager Library*, en **React**. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 5:00 p. m.** (17:00). Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3145556-api`](https://github.com/code-sena/test-manager-library-3145556-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3145556-app`](https://github.com/code-sena/test-manager-library-3145556-app) | Frontend en React |
| [`test-manager-library-3145556-page`](https://github.com/code-sena/test-manager-library-3145556-page) | Sitio público estático de presentación |
| [`test-manager-library-3145556-infra`](https://github.com/code-sena/test-manager-library-3145556-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3145556-tool`](https://github.com/code-sena/test-manager-library-3145556-tool) | Utilidades: sembrador de datos de demostración |

---

## Cómo correr el frontend (T-22)

```bash
cp .env.example .env        # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev                 # http://localhost:5173
npm test                    # pruebas con Vitest y Testing Library
npm run build               # build de producción en dist/
```

Con Docker: `docker build --build-arg VITE_API_URL=http://localhost:8000/api/v1 -t library-app . && docker run -p 5173:5173 library-app` (o `docker compose up` desde `infra`). La API debe permitir el origen `http://localhost:5173` (`CORS_ORIGIN`).

## Recorrido de punta a punta

1. **Login** con el usuario administrador definido en el entorno de la API.
2. **Bibliotecarios** (solo admin): crear un bibliotecario.
3. **Catálogo**: el admin crea libros, edita, da de baja y sube portadas (JPG/PNG, máx. 2 MB); todos buscan por texto y categoría.
4. **Socios**: crear y buscar; el detalle muestra los libros sin devolver.
5. **Prestar**: elegir socio y de 1 a 3 libros; los errores del servidor (sin ejemplares, tope de 3, socio con vencidos) se muestran en español.
6. **Préstamos**: filtrar por fechas, estado y socio; **Devolver** una línea a la vez.
7. **Vencidos**: ordenados por días de retraso.
8. **Reporte** (solo admin): libros más prestados en un rango de fechas.

## Estructura

```text
src/
├── api/client.js        # fetch con Bearer; convierte {code, message, details} en ApiError
├── auth/AuthContext.jsx # sesión en sessionStorage, expira a las 8 h, cierra sesión ante un 401
├── components/          # Layout, Pagination, ErrorBanner, RoleGuard
└── pages/               # Login, Books, Members, NewLoan, Loans, Overdue, Report, Users
```

Notas: la portada se pide con `fetch` y se muestra como blob porque `<img>` no envía el token. Las rutas y los botones de administración solo se muestran al rol `admin`, pero quien manda es la API (403).
