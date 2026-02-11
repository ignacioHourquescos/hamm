# HAMM - Agencia Comercial 360°

Sitio web profesional para HAMM - Agencia Comercial 360°, una agencia especializada en representación comercial, trade marketing, producción POP y consumo masivo.

## Características

- ✨ Diseño moderno y responsive
- 📱 Compatible con dispositivos móviles
- 🎨 Animaciones suaves y transiciones
- 💬 Botón flotante de WhatsApp
- 🧭 Navegación suave entre secciones
- ⚡ Optimizado para rendimiento

## Estructura del Proyecto

```
hamm/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript para interactividad
├── base.md             # Contenido original
└── README.md           # Este archivo
```

## Secciones

1. **Home** - Hero section con introducción a la agencia
2. **Qué hacemos** - Servicios principales (4 tarjetas)
3. **Quiénes Somos** - Información sobre la empresa
4. **Servicios** - Detalle de todos los servicios ofrecidos
5. **Marcas** - Marcas representadas
6. **Contacto** - Información de contacto de los fundadores

## Cómo usar

1. Abre `index.html` en tu navegador
2. O sirve los archivos usando un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

## Personalización

### Colores
Los colores principales están definidos en `styles.css` en la sección `:root`:
- `--primary-color`: Color principal (#1a1a1a)
- `--accent-color`: Color de acento (#d4af37)
- Puedes modificar estos valores para cambiar el esquema de colores

### Contenido
Edita directamente el archivo `index.html` para modificar el contenido de las secciones.

### WhatsApp
El botón de WhatsApp está configurado con el número de Andres Moller. Para cambiarlo, modifica el atributo `href` del elemento con clase `whatsapp-float` en `index.html`.

## Tecnologías Utilizadas

- HTML5
- CSS3 (con variables CSS y Grid/Flexbox)
- JavaScript (Vanilla JS)
- Font Awesome (iconos)

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive design para móviles, tablets y desktop

## Notas

- El sitio está listo para producción
- Puedes agregar imágenes en las secciones correspondientes
- Los logos de las marcas pueden agregarse como imágenes en la sección "Marcas"


