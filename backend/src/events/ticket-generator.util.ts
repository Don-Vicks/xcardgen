export function generateTicketHtml(
  template: any,
  values: Record<string, any>,
  options?: { removeBranding?: boolean },
): string {
  const width = template.properties?.width || 600;
  const height = template.properties?.height || 400;
  const backgroundImage = template.backgroundImage;
  const elements = template.canvasData || [];

  const elementsHtml = elements
    .map((el: any) => {
      // Variable Substitution
      let content = el.content || '';
      let src = el.src || '';

      if (el.isDynamic || el.type === 'variable') {
        if (el.type === 'text' && content) {
          content = content.replace(
            /\{\{\s*(\w+)\s*\}\}/g,
            (_: string, key: string) => {
              return values[key] || '';
            },
          );
        }
        if (el.type === 'image' && el.fieldName && values[el.fieldName]) {
          src = values[el.fieldName];
        }
        if (el.type === 'qrcode' && content) {
          content = content.replace(
            /\{\{\s*(\w+)\s*\}\}/g,
            (_: string, key: string) => {
              return values[key] || '';
            },
          );
        }
      }

      // Styles
      const styleObj = {
        position: 'absolute',
        top: `${el.y}px`,
        left: `${el.x}px`,
        width: `${el.width}px`,
        height: `${el.height}px`,
        ...el.style,
      };

      // Convert style obj to CSS string
      const styleStr = Object.entries(styleObj)
        .map(([k, v]) => {
          // Simple camelCase to kebab-case conversion for CSS properties
          const key = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          return `${key}: ${v}`;
        })
        .join('; ');

      // Inner Content
      let inner = '';
      if (el.type === 'text') {
        inner = `<span style="line-height: 1.2; width: 100%; display: block; word-wrap: break-word;">${content}</span>`;
      } else if (el.type === 'image') {
        if (src) {
          inner = `<img src="${src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: ${el.style?.borderRadius || 0};" />`;
        }
      } else if (el.type === 'qrcode') {
        // Generating QR code logic in Puppeteer/HTML is tricky without JS or image.
        // We can use an external API or data URI.
        // Simpler: Use a QR code generation library to get Data URI here?
        // Or inject a script in HTML to render it?
        // Puppeteer runs JS. So we can use a script.
        // <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
        // <div id="qr-${el.id}"></div>
        // <script>new QRCode(document.getElementById("qr-${el.id}"), "${content}");</script>
        inner = `
           <div id="qr-${el.id}" style="width: 100%; height: 100%; background: ${el.style?.backgroundColor || 'white'}; display: flex; justify-content: center; align-items: center;"></div>
           <script>
             new QRCode(document.getElementById("qr-${el.id}"), {
               text: "${content}",
               width: ${el.width - 16}, // padding
               height: ${el.height - 16},
               colorDark : "${el.style?.color || '#000000'}",
               colorLight : "${el.style?.backgroundColor || '#ffffff'}",
               correctLevel : QRCode.CorrectLevel.H
             });
           </script>
         `;
      } else if (el.type === 'shape') {
        inner = `<div style="width: 100%; height: 100%; background-color: ${el.style?.backgroundColor}; border-radius: ${el.style?.borderRadius || 0};"></div>`;
      }

      return `<div style="${styleStr}; overflow: hidden; display: flex; align-items: center; justify-content: center;">${inner}</div>`;
    })
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&display=swap');
        body { margin: 0; padding: 0; }
        .canvas {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-image: url('${backgroundImage}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            overflow: hidden;
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    </head>
    <body>
      <div class="canvas">
        ${elementsHtml}
        ${
          options?.removeBranding
            ? ''
            : `
        <div style="position: absolute; bottom: 25px; right: 25px; font-family: 'Inter', system-ui, sans-serif; font-size: 20px; color: rgba(255, 255, 255, 0.95); background: rgba(0, 0, 0, 0.25); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 99px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 1000; letter-spacing: 0.3px;">
          <span style="opacity: 0.8; font-weight: 400;">Create yours at</span>
          <span style="font-weight: 700; letter-spacing: -0.3px;">xCardGen</span>
        </div>
        `
        }
      </div>
    </body>
    </html>
  `;
}
