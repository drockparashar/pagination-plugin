# TipTap Pagination Plugin

A Next.js project implementing **automatic pagination** for TipTap rich text editor with PDF export compatibility.

## 🎯 Project Overview

This project demonstrates a production-ready pagination system for TipTap editor that:
- ✅ Automatically inserts page breaks based on content height
- ✅ Maintains consistent page breaks between editor and PDF export
- ✅ Tracks content height in real-time
- ✅ Supports A4 page size (1123px at 96 DPI)
- ✅ Works seamlessly with TipTap's editing features

## 🚀 Features

### **1. Automatic Page Break Insertion**
- Calculates optimal page break positions based on content height
- Inserts visual page break markers at 1123px intervals (A4 page height)
- Debounced updates (500ms) to prevent lag during typing

### **2. Height Tracking System**
- Real-time measurement of editor content height
- Tracks individual node heights and cumulative positions
- Calculates page count and overflow metrics

### **3. PDF Export Compatibility**
- CSS `page-break-after: always` ensures breaks appear in PDF
- Print stylesheet with proper page margins and formatting
- Widow/orphan prevention for better typography

### **4. Visual Indicators**
- Page break lines with labels showing page numbers
- Clean, minimal design that doesn't interfere with editing
- Hidden in PDF/print output

## 📁 Project Structure

```
pagination-plugin/
├── components/
│   ├── tiptap-extension/
│   │   ├── page-break-extension.ts      # TipTap PageBreak node
│   │   ├── page-break-component.tsx     # React component for breaks
│   │   └── page-break.scss              # Page break styling
│   ├── tiptap-templates/
│   │   └── simple/
│   │       ├── simple-editor.tsx        # Main editor component
│   │       └── simple-editor.scss       # Editor styling
│   └── tiptap-ui/                       # UI components (buttons, toolbars, etc.)
├── hooks/
│   ├── use-editor-height.ts             # Height tracking & page break calculator
│   └── use-page-break-manager.ts        # Auto-insertion manager
├── styles/
│   └── print.scss                       # PDF export stylesheet
└── app/
    └── simple/
        └── page.tsx                     # Simple editor demo page
```

## 🔧 Core Components

### **1. PageBreak Extension**
Custom TipTap node that represents page breaks in the document.

**File:** `components/tiptap-extension/page-break-extension.ts`

**Features:**
- Atom node (cannot be edited or split)
- Commands: `setPageBreak()`, `removeAllPageBreaks()`
- Stores page number in node attributes
- React node view for visual rendering

### **2. Height Manager Hook**
Tracks content height and calculates page break positions.

**File:** `hooks/use-editor-height.ts`

**Provides:**
- `contentHeight` - Total content height in pixels
- `pageCount` - Number of pages
- `isOverflowing` - Whether content exceeds one page
- `nodeHeights` - Array of individual node heights with positions
- `calculatePageBreaks()` - Algorithm to determine break positions

### **3. Page Break Manager Hook**
Automatically inserts and updates page breaks.

**File:** `hooks/use-page-break-manager.ts`

**Features:**
- Auto-insertion with configurable debounce
- Removes old breaks before inserting new ones
- Manual `recalculate()` function
- Prevents unnecessary updates

## 🎨 How It Works

### **Page Break Algorithm**

```typescript
1. Track cumulative height of all nodes
2. When cumulative height > PAGE_HEIGHT (1123px):
   → Insert page break after previous node
   → Start new page
3. Repeat for each subsequent page
4. Handle nodes taller than one page (split across pages)
```

### **Data Flow**

```
User Types
    ↓
Editor Updates
    ↓
useEditorHeight tracks node heights
    ↓
calculatePageBreaks determines positions
    ↓
usePageBreakManager inserts break nodes
    ↓
Visual indicators rendered
    ↓
PDF export uses CSS page-break-after
```

## 🛠️ Getting Started

### **Installation**

```bash
npm install
# or
yarn install
```

### **Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000/simple](http://localhost:3000/simple) to see the editor.

### **Usage in Your Editor**

```typescript
import { useEditor } from '@tiptap/react';
import { PageBreak } from '@/components/tiptap-extension/page-break-extension';
import { useEditorHeight } from '@/hooks/use-editor-height';
import { usePageBreakManager } from '@/hooks/use-page-break-manager';

function MyEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      PageBreak, // Add page break extension
      // ... other extensions
    ],
  });

  // Track height metrics
  const heightMetrics = useEditorHeight(editor);

  // Auto-manage page breaks
  usePageBreakManager(editor, heightMetrics, {
    autoInsert: true,
    debounceMs: 500,
  });

  return <EditorContent editor={editor} />;
}
```

## 📊 Configuration

### **Page Height**

Default: `1123px` (A4 at 96 DPI)

To change:
```typescript
// In use-editor-height.ts
export const PAGE_HEIGHT = 1056; // Letter size at 96 DPI
```

### **Debounce Delay**

Default: `500ms`

To change:
```typescript
usePageBreakManager(editor, heightMetrics, {
  debounceMs: 300, // Faster updates
});
```

### **Auto-Insert**

Default: `true`

To disable:
```typescript
usePageBreakManager(editor, heightMetrics, {
  autoInsert: false, // Manual control
});
```

## 🖨️ PDF Export

The project includes a print stylesheet (`styles/print.scss`) that ensures page breaks work correctly in PDF exports.

### **Print Features:**
- A4 page size with 0.5 inch margins
- Hides UI elements (toolbar, metrics)
- Proper page break handling
- Widow/orphan prevention
- Keep-together rules for headings and code blocks

### **To Export as PDF:**
1. Open the editor in browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Page breaks will match editor view exactly

## 🎓 Key Concepts

### **Why Pixel-Based Measurement?**
- Text wraps differently at different widths
- Different content types have different heights
- Precise pagination requires exact measurements
- Line-based counting doesn't work for rich content

### **Why Page Break Markers?**
- Single TipTap editor instance (no content duplication)
- Full editing capabilities maintained
- Low memory usage
- CSS `page-break-after` is standard for PDF
- Scales well to 50+ pages

### **Algorithm Complexity**
- **Time:** O(n) where n = number of nodes
- **Space:** O(p) where p = number of pages
- **Update:** O(n) on content change (debounced)

## 🔍 Debugging

### **Console Logs**

The height manager logs metrics on every update:
```
📏 Editor Height Metrics: {
  contentHeight: "2500px",
  pageCount: 3,
  isOverflowing: true,
  overflowAmount: "254px",
  nodeCount: 15
}
```

Page break manager logs insertions:
```
📄 Updating page breaks: {
  old: 2,
  new: 3,
  positions: [1123, 2246, 3369]
}
```

## 🚧 Known Limitations

- Page breaks may split content mid-paragraph (edge case handling needed)
- Very large images may exceed page height
- Tables crossing page boundaries need special handling
- Lists maintain numbering but may need visual improvements

## 🔮 Future Enhancements

- [ ] Manual page break insertion via toolbar button
- [ ] Keep-together rules for headings + following paragraph
- [ ] Page headers and footers
- [ ] Automatic page numbering
- [ ] Different page size presets (Letter, Legal, etc.)
- [ ] Margin configuration
- [ ] Better handling of images and tables

## 📚 Technologies Used

- **Next.js 16.1.3** - React framework
- **TipTap 2.x** - Rich text editor
- **TypeScript** - Type safety
- **SCSS** - Styling
- **React 18** - UI library

## 📖 Documentation

For detailed technical analysis and implementation approaches, see:
- [Component Overview](./brain/tiptap-components-overview.md)
- [Content Measurement Guide](./brain/tiptap-content-measurement-guide.md)
- [Pagination Approaches Analysis](./brain/pagination-approaches-analysis.md)

## 🤝 Contributing

This is a demonstration project. Feel free to use the code and concepts in your own projects.

## 📄 License

MIT

---

**Built with ❤️ using TipTap and Next.js**
