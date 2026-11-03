import { describe, expect, it } from 'vitest';
import { detectDocumentKind } from './document-signature.js';

const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const pad = (n: number) => Buffer.alloc(n, 0);

const pdf = Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\n', 'latin1');
const pdfWithPreamble = Buffer.concat([Buffer.from('\r\n\r\n', 'latin1'), pdf]);
const doc = Buffer.concat([OLE2, pad(500), Buffer.from('WordDocument', 'utf16le'), pad(64)]);
const xls = Buffer.concat([OLE2, pad(500), Buffer.from('Workbook', 'utf16le'), pad(64)]);
const docx = Buffer.concat([
  ZIP,
  pad(26),
  Buffer.from('[Content_Types].xml', 'latin1'),
  pad(40),
  Buffer.from('word/document.xml', 'latin1'),
  pad(40),
]);
const xlsx = Buffer.concat([ZIP, pad(26), Buffer.from('xl/workbook.xml', 'latin1'), pad(40)]);
const plainZip = Buffer.concat([ZIP, pad(26), Buffer.from('payload.exe', 'latin1'), pad(40)]);

describe('detectDocumentKind', () => {
  it('recognises PDF, DOC and DOCX', () => {
    expect(detectDocumentKind(pdf)).toBe('pdf');
    expect(detectDocumentKind(doc)).toBe('doc');
    expect(detectDocumentKind(docx)).toBe('docx');
  });

  it('accepts a PDF header after a short preamble (as PDF readers do)', () => {
    expect(detectDocumentKind(pdfWithPreamble)).toBe('pdf');
  });

  it('rejects other Office files that share the Word containers', () => {
    expect(detectDocumentKind(xls)).toBeNull();
    expect(detectDocumentKind(xlsx)).toBeNull();
    expect(detectDocumentKind(plainZip)).toBeNull();
  });

  it('rejects executables, web pages and images renamed as CVs', () => {
    expect(detectDocumentKind(Buffer.from('MZ\x90\x00\x03\x00', 'latin1'))).toBeNull();
    expect(detectDocumentKind(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(detectDocumentKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBeNull();
    expect(detectDocumentKind(Buffer.alloc(0))).toBeNull();
  });

  it('ignores a PDF marker buried deep inside another file', () => {
    const disguised = Buffer.concat([Buffer.from('MZ', 'latin1'), pad(2048), Buffer.from('%PDF-1.4')]);
    expect(detectDocumentKind(disguised)).toBeNull();
  });
});
