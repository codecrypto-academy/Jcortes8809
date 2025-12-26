# 🔧 GUÍA RÁPIDA DE MIGRACIÓN I18N

## 📝 PATRÓN DE ACTUALIZACIÓN

Para cada archivo `.tsx`, seguir estos pasos:

### 1. Importar useLanguage
```typescript
import { useLanguage } from "@/contexts/LanguageContext";
```

### 2. Usar el hook en el componente
```typescript
export default function MyPage() {
  const { t } = useLanguage();
  // ... resto del código
}
```

### 3. Reemplazar textos hardcodeados
```typescript
// ANTES:
<h1>My Tokens</h1>
<Button>Create Token</Button>
<p>No tokens found</p>

// DESPUÉS:
<h1>{t("tokens.title")}</h1>
<Button>{t("tokens.createToken")}</Button>
<p>{t("tokens.noTokens")}</p>
```

---

## 📁 ARCHIVOS PENDIENTES CON CAMBIOS ESPECÍFICOS

### 1. web/app/tokens/page.tsx

**Importar:**
```typescript
import { useLanguage } from "@/contexts/LanguageContext";
```

**En el componente:**
```typescript
const { t } = useLanguage();
```

**Reemplazos de texto:**
```typescript
"My Tokens" → {t("tokens.title")}
"View and manage all your tokens" → {t("tokens.description")}
"Create Token" → {t("tokens.createToken")}
"All Tokens" → {t("common.all")} + " " + {t("tokens.title")}
"With Balance" → "With Balance" (mantener o agregar a traducciones)
"Created by Me" → "Created by Me" (mantener o agregar a traducciones)
"You don't have any tokens yet." → {t("tokens.noTokensDesc")}
```

---

### 2. web/app/tokens/create/page.tsx

**Textos a reemplazar:**
```typescript
"Create Token" → {t("createToken.title")}
"Create a new token" → {t("createToken.description")}
"Token Name" → {t("createToken.tokenName")}
"Total Supply" → {t("createToken.totalSupply")}
"Description" → {t("createToken.description")}
"Origin" → {t("createToken.origin")}
"Certifications" → {t("createToken.certifications")}
"Parent Token" → {t("createToken.parentToken")}
"Creating..." → {t("createToken.creating")}
"Create" → {t("common.create")}
"Cancel" → {t("common.cancel")}
```

---

### 3. web/app/tokens/[id]/page.tsx

**Textos a reemplazar:**
```typescript
"Token Details" → {t("tokens.tokenDetails")}
"Token Name" → {t("tokens.tokenName")}
"Total Supply" → {t("tokens.totalSupply")}
"Your Balance" → {t("tokens.yourBalance")}
"Creator" → {t("tokens.creator")}
"Created" → {t("tokens.created")}
"Features" → {t("tokens.features")}
"Parent Token" → {t("tokens.parentToken")}
"No parent (raw material)" → {t("tokens.noParent")}
"View Parent" → {t("tokens.viewParent")}
"Transfer" → {t("tokens.transfer")}
```

---

### 4. web/app/tokens/[id]/transfer/page.tsx

**Ya está parcialmente traducido, completar:**
```typescript
// Verificar que todos los textos usen t()
// Ya tiene la mayoría, solo revisar mensajes de error
```

---

### 5. web/app/transfers/page.tsx

**Textos a reemplazar:**
```typescript
"Transfers" → {t("transfers.title")}
"Manage your token transfers" → {t("transfers.description")}
"Sent" → {t("transfers.sent")}
"Received" → {t("transfers.received")}
"No transfers found" → {t("transfers.noTransfers")}
"From" → {t("transfers.from")}
"To" → {t("transfers.to")}
"Token" → {t("transfers.token")}
"Amount" → {t("transfers.amount")}
"Status" → {t("transfers.status")}
"Date" → {t("transfers.date")}
"Accept" → {t("transfers.accept")}
"Reject" → {t("transfers.reject")}
```

---

### 6. web/app/profile/page.tsx

**Textos a reemplazar:**
```typescript
"My Profile" → {t("profile.title")}
"View your account information" → {t("profile.description")}
"Wallet Address" → {t("profile.address")}
"Role" → {t("profile.role")}
"Status" → {t("profile.status")}
"Account Information" → {t("profile.accountInfo")}
"Preferences" → {t("profile.preferences")}
"Language" → {t("common.language")}
```

---

### 7. web/app/admin/users/page.tsx

**Completar traducciones (ya tiene algunas):**
```typescript
// Asegurar que TODOS los textos usen t()
// Especialmente:
"User Management" → {t("admin.title")}
"Total Users" → {t("admin.totalUsers")}
"Pending" → {t("admin.pending")}
"Approve" → {t("admin.approve")}
"Reject" → {t("admin.reject")}
"Revoke" → {t("admin.revoke")}
// etc...
```

---

## 🎯 COMANDO PARA BUSCAR TEXTO HARDCODEADO

```bash
# Buscar strings entre comillas que probablemente necesiten traducción
grep -r '"[A-Z][a-z].*"' web/app --include="*.tsx" | grep -v "className" | grep -v "href"
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Para cada archivo actualizado:

- [ ] Importado `useLanguage` context
- [ ] Declarado `const { t } = useLanguage()`
- [ ] Todos los textos visibles usan `t()`
- [ ] Los placeholders usan `t()`
- [ ] Los mensajes de error/éxito usan `t()`
- [ ] Los títulos y descripciones usan `t()`
- [ ] No hay strings hardcodeados excepto:
  - ClassNames
  - Hrefs internos
  - Constantes técnicas

---

## 🚀 INSTALACIÓN Y PRUEBA

```bash
# Instalar dependencia
cd web
npm install @radix-ui/react-dropdown-menu

# Ejecutar
npm run dev

# Probar:
1. Cambiar idioma en header
2. Navegar por todas las páginas
3. Verificar que todo el texto cambia
4. Verificar que persiste al recargar
```

---

## 💡 TIPS

1. **No traducir:**
   - Nombres de roles (Producer, Factory, etc.) en constantes
   - Direcciones de wallet
   - Hashes de transacciones
   - Valores numéricos

2. **Sí traducir:**
   - Labels de formularios
   - Botones
   - Mensajes
   - Títulos y descripciones
   - Placeholders
   - Estados

3. **Parámetros dinámicos:**
```typescript
t("transfer.allowedFlowDesc", {
  role: userInfo.role,
  allowedRoles: allowedRoles.join(", ")
})
```

---

## ⏱️ TIEMPO ESTIMADO POR ARCHIVO

- tokens/page.tsx: 10 min
- tokens/create/page.tsx: 15 min
- tokens/[id]/page.tsx: 10 min
- tokens/[id]/transfer/page.tsx: 5 min (completar)
- transfers/page.tsx: 10 min
- profile/page.tsx: 10 min
- admin/users/page.tsx: 15 min

**Total:** ~75 minutos para completar todo

---

## 📊 CUANDO ESTÉ TERMINADO

```
✅ 12/12 páginas traducidas (100%)
✅ 8/8 componentes traducidos (100%)
✅ 200+ strings en 2 idiomas
✅ Sistema i18n completo y funcional
```

🎉 **¡Proyecto completamente multiidioma!**
