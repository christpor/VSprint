import React from 'react';

export const LivePreview = ({ html, css, js }: { html?: string, css?: string, js?: string }) => {
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #1e293b;
            line-height: 1.5;
          }
          ${css || ''}
        </style>
      </head>
      <body>
        ${html || ''}
        <script>
          try {
            ${js || ''}
          } catch (err) {
            console.error('Live Preview Error:', err);
            document.body.innerHTML += '<div style="color: red; margin-top: 20px; font-family: monospace;">Error: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
      <iframe
        srcDoc={content}
        title="Live Preview"
        className="w-full h-full min-h-[400px] border-none"
        sandbox="allow-scripts"
      />
    </div>
  );
};
