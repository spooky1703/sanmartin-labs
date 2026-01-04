# 🚀 Instrucciones de Deploy a Railway

## ✅ Pasos para Desplegar Actualización

### 1. Push de Código
```bash
git add .
git commit -m "feat: Add report creator and redesign PDF layout"
git push
```

Railway automáticamente detectará el push y empezará el build.

---

### 2. Verificar Build en Railway

1. Ve a [railway.app](https://railway.app)
2. Entra a tu proyecto
3. Ve a la pestaña **Deployments**
4. Espera a que el build termine (aparecerá ✓ verde)

**Tiempos esperados:**
- Build: ~3-5 minutos
- Deploy: ~30 segundos

---

### 3. ⚠️ IMPORTANTE: No hay cambios en la base de datos

Los cambios NO requieren actualizar el schema de Prisma porque:
- El campo `usuarioId` ya existía en el modelo `Reporte`
- La relación al modelo `Usuario` ya estaba configurada

**No es necesario correr `prisma db push`** ✅

---

### 4. Verificar Variables de Entorno

Asegúrate que Railway tenga configuradas:
```env
DATABASE_URL=postgres://...
NEXTAUTH_URL=https://tuapp.up.railway.app
NEXTAUTH_SECRET=your-secret-key
```

*Nota: No necesitas SMTP ni Resend porque se usa mailto/WhatsApp*

---

### 5. Verificación Post-Deploy

**Prueba 1: Generar un reporte nuevo**
1. Login en el sistema
2. Genera un nuevo reporte
3. Verifica el PDF:
   - ✓ No debe aparecer "REPORTE DE RESULTADOS"
   - ✓ Debe mostrar "EMITIDO POR: Tu Nombre"
   - ✓ No debe mostrar Fecha de Nacimiento
   - ✓ Debe aparecer "FIRMA DE RESPONSABLE" al final
   - ✓ Debajo del QR solo debe decir "Escanea para consultar"

**Prueba 2: Consulta pública**
1. Usa el código QR del reporte
2. Verifica que el PDF público también tenga los nuevos cambios

---

### 6. Rollback (Si algo falla)

Si el deploy falla, puedes hacer rollback:

**Opción A: Desde Railway UI**
1. Ve a **Deployments**
2. Click en el deployment anterior que funcionaba
3. Click **Redeploy**

**Opción B: Desde código**
```bash
git log --oneline  # Ver commits
git revert HEAD    # Revertir último commit
git push
```

---

### 7. Logs y Debugging

**Ver logs en tiempo real:**
```
Railway Dashboard → Service → Logs
```

**Filtrar errores:**
Busca líneas con `ERROR` o `error`

**Logs comunes:**
- ✅ `Ready in XXXms` = Deploy exitoso
- ❌ `Can't reach database` = Error de conexión DB
- ❌ `Module not found` = Falta dependencia

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- Verifica `DATABASE_URL` en Variables de Entorno
- PostgreSQL debe estar corriendo en Railway

### Error: "Module 'X' not found"
```bash
npm install
git add package-lock.json
git commit -m "fix: Update dependencies"
git push
```

### PDF no genera correctamente
- Verifica que `/public/images/logo.png` exista
- Verifica que `/public/images/plantilla.png` exista

---

## 📊 Monitoreo Post-Deploy

- **Métricas:** Railway Dashboard → Metrics
- **CPU/RAM:** Revisa usage normal < 512MB
- **Crashes:** Si el app se reinicia solo, revisa logs

---

## ✨ Nuevas Funcionalidades Activas

Después del deploy, el sistema tendrá:
- ✅ Registro automático de quién creó cada reporte
- ✅ PDF con diseño limpio (sin header redundante)
- ✅ Campo "Emitido por" en lugar de fecha de nacimiento
- ✅ Sección de firma al final del PDF
- ✅ QR más limpio (solo texto "Escanear")
