
import { Tool, ToolCategory } from './types';
import { 
    MergeIcon, SplitIcon, CompressIcon, WordIcon, PowerPointIcon, ExcelIcon, JpgIcon, 
    OrganizeIcon, EditIcon, RotateIcon, UnlockIcon, ProtectIcon, PageNumberIcon, 
    WatermarkIcon, ImageIcon, QrCodeIcon, PasswordIcon, CounterIcon, AgeIcon, BmiIcon,
    ColorPickerIcon, UnitConverterIcon, JsonIcon, TextToSpeechIcon, SpeechToTextIcon, TimerIcon
} from './components/icons/ToolIcons';

export const TOOLS: Tool[] = [
  // PDF Tools
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDFs into one single document.', icon: MergeIcon, category: ToolCategory.PDF },
  { id: 'split-pdf', title: 'Split PDF', description: 'Extract pages from a PDF or save each page as a separate PDF.', icon: SplitIcon, category: ToolCategory.PDF },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce the file size of your PDF while optimizing for quality.', icon: CompressIcon, category: ToolCategory.PDF },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert your PDFs to editable DOC and DOCX files.', icon: WordIcon, category: ToolCategory.PDF },
  { id: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', description: 'Convert your PDFs to easy-to-edit PPT and PPTX slideshows.', icon: PowerPointIcon, category: ToolCategory.PDF },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Pull data directly from PDFs into Excel spreadsheets.', icon: ExcelIcon, category: ToolCategory.PDF },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert Word documents to PDF format.', icon: WordIcon, category: ToolCategory.PDF },
  { id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', description: 'Convert PowerPoint presentations to PDF format.', icon: PowerPointIcon, category: ToolCategory.PDF },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF format.', icon: ExcelIcon, category: ToolCategory.PDF },
  { id: 'edit-pdf', title: 'Edit PDF', description: 'Add text, images, shapes or freehand annotations to a PDF.', icon: EditIcon, category: ToolCategory.PDF },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Extract all images from a PDF or convert each page to JPG.', icon: JpgIcon, category: ToolCategory.PDF },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', icon: JpgIcon, category: ToolCategory.PDF },
  { id: 'add-page-numbers', title: 'Add Page Numbers', description: 'Insert page numbers in PDFs easily. Choose your positions, dimensions, typography.', icon: PageNumberIcon, category: ToolCategory.PDF },
  { id: 'add-watermark', title: 'Add Watermark', description: 'Stamp an image or text over your PDF in seconds.', icon: WatermarkIcon, category: ToolCategory.PDF },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once.', icon: RotateIcon, category: ToolCategory.PDF },
  { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', icon: UnlockIcon, category: ToolCategory.PDF },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Encrypt your PDF with a password to keep sensitive data confidential.', icon: ProtectIcon, category: ToolCategory.PDF },
  { id: 'organize-pdf', title: 'Organize PDF', description: 'Sort, add, and delete PDF pages. You can merge multiple PDFs, too.', icon: OrganizeIcon, category: ToolCategory.PDF },

  // Image Tools
  { id: 'image-compressor', title: 'Image Compressor', description: 'Reduce image file size without losing quality.', icon: ImageIcon, category: ToolCategory.IMAGE },
  { id: 'image-converter', title: 'Image Converter', description: 'Convert images between JPG, PNG, and WEBP.', icon: ImageIcon, category: ToolCategory.IMAGE },

  // Text Tools
  { id: 'word-counter', title: 'Word & Character Counter', description: 'Count words and characters in your text.', icon: CounterIcon, category: ToolCategory.TEXT },
  { id: 'json-formatter', title: 'JSON Formatter', description: 'Format and validate JSON data.', icon: JsonIcon, category: ToolCategory.TEXT },
  { id: 'text-to-speech', title: 'Text to Speech', description: 'Convert text into spoken audio.', icon: TextToSpeechIcon, category: ToolCategory.TEXT },
  { id: 'speech-to-text', title: 'Speech to Text', description: 'Transcribe spoken words into text.', icon: SpeechToTextIcon, category: ToolCategory.TEXT },

  // Utility Tools
  { id: 'qr-code-generator', title: 'QR Code Generator', description: 'Create QR codes for URLs, text, and more.', icon: QrCodeIcon, category: ToolCategory.UTILITY },
  { id: 'password-generator', title: 'Password Generator', description: 'Generate strong, secure passwords.', icon: PasswordIcon, category: ToolCategory.UTILITY },
  { id: 'age-calculator', title: 'Age Calculator', description: 'Calculate age from a date of birth.', icon: AgeIcon, category: ToolCategory.UTILITY },
  { id: 'bmi-calculator', title: 'BMI Calculator', description: 'Calculate your Body Mass Index.', icon: BmiIcon, category: ToolCategory.UTILITY },
  { id: 'color-picker', title: 'Color Picker', description: 'Pick colors from an interactive color wheel.', icon: ColorPickerIcon, category: ToolCategory.UTILITY },
  { id: 'unit-converter', title: 'Unit Converter', description: 'Convert between various units of measurement.', icon: UnitConverterIcon, category: ToolCategory.UTILITY },
  { id: 'timer-stopwatch', title: 'Timer / Stopwatch', description: 'A simple timer and stopwatch utility.', icon: TimerIcon, category: ToolCategory.UTILITY },
];
