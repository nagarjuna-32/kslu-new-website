// Minimal valid PDF generator for sample PYQs and Study Notes in local development
const fs = require('fs');
const path = require('path');

function createSamplePdf(filePath, title, subtitle, contentLines = []) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Construct PDF stream text
  const cleanTitle = (title || 'KSLU Academic Document').replace(/[()\\]/g, '');
  const cleanSub = (subtitle || 'Karnataka State Law University Academic Resource').replace(/[()\\]/g, '');
  
  let streamText = `BT /F1 20 Tf 50 750 Td (${cleanTitle}) Tj ET\n`;
  streamText += `BT /F1 12 Tf 50 720 Td (${cleanSub}) Tj ET\n`;
  streamText += `BT /F1 10 Tf 50 700 Td (Verified Academic Document - KSLU Circle Platform) Tj ET\n`;
  
  let y = 660;
  for (const line of contentLines) {
    const cleanLine = line.replace(/[()\\]/g, '');
    streamText += `BT /F1 10 Tf 50 ${y} Td (${cleanLine}) Tj ET\n`;
    y -= 20;
    if (y < 80) break;
  }

  const streamLength = Buffer.byteLength(streamText, 'utf8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF
`;

  fs.writeFileSync(filePath, pdf, 'utf8');
  return filePath;
}

module.exports = { createSamplePdf };
