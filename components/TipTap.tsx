import React from 'react'

import { useEditor,EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TipTap = () => {
  const editor=useEditor({
    extensions: [StarterKit],
    content:'<p>Start Typing .....</p>',
    immediatelyRender:false,
    editorProps: {
    attributes: {
      class: 'prose h-full prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
  }
  })
  return (
     <EditorContent editor={editor}/>
  )
}

export default TipTap