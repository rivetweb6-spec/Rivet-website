/**
 * Verify that an uploaded CV really is a PDF or Word document.
 *
 * The browser-supplied Content-Type and the filename are both under the
 * uploader's control, so on their own they let anyone store arbitrary bytes
 * (an executable, an HTML page, a zip bomb) that HR staff will later
 * download and open. The container signature is checked instead, and the
 * detected type — not the declared one — decides the stored extension and
 * the Content-Type the file is served with.
 */
export type DocumentKind = 'pdf' | 'doc' | 'docx';

export const DOCUMENT_MIME: Record<DocumentKind, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export const DOCUMENT_EXT: Record<DocumentKind, string> = {
  pdf: '.pdf',
  doc: '.doc',
  docx: '.docx',
};

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/** OLE2 / Compound File Binary header, shared by .doc, .xls, .ppt, .msi … */
const OLE2 = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
/** The stream every Word 97–2003 document has, as stored in the OLE2 directory (UTF-16LE). */
const WORD_STREAM = Buffer.from('WordDocument', 'utf16le');

/** ZIP local file header, shared by .docx, .xlsx, .pptx, .jar, plain zips … */
const ZIP = [0x50, 0x4b, 0x03, 0x04];
/** The part every Word 2007+ document has; zip entry names are stored as plain bytes. */
const DOCX_MAIN_PART = Buffer.from('word/document.xml', 'latin1');

/** PDF readers accept the header anywhere in the first 1 KB. */
const PDF_HEADER = Buffer.from('%PDF-', 'latin1');

/** The document type the bytes actually contain, or null if it is not a PDF/DOC/DOCX. */
export function detectDocumentKind(buf: Buffer): DocumentKind | null {
  if (buf.subarray(0, 1024).includes(PDF_HEADER)) return 'pdf';
  if (startsWith(buf, OLE2)) return buf.includes(WORD_STREAM) ? 'doc' : null;
  if (startsWith(buf, ZIP)) return buf.includes(DOCX_MAIN_PART) ? 'docx' : null;
  return null;
}
