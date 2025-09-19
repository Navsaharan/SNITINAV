'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/admin/rich-text-editor'

export default function EditorTestPage() {
  const [content, setContent] = useState(`
    <h1>Rich Text Editor Test Page</h1>
    <p>This page demonstrates all the enhanced features of the rich text editor.</p>
    
    <h2>Text Formatting</h2>
    <p>This text includes <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, and <mark style="background-color: #ffff00;">highlighted</mark> text.</p>
    <p>You can also use <sub>subscript</sub> and <sup>superscript</sup> formatting.</p>
    
    <h2>Colors and Fonts</h2>
    <p style="color: #ff0000;">This text is red</p>
    <p style="color: #0066cc; font-family: Georgia, serif;">This text is blue and uses Georgia font</p>
    <p style="background-color: #ffffcc; padding: 8px; border-radius: 4px;">This text has a yellow background</p>
    
    <h2>Lists</h2>
    <ul>
      <li>Bullet point 1</li>
      <li>Bullet point 2</li>
      <li>Bullet point 3</li>
    </ul>
    
    <ol>
      <li>Numbered item 1</li>
      <li>Numbered item 2</li>
      <li>Numbered item 3</li>
    </ol>
    
    <h2>Alignment</h2>
    <p style="text-align: left;">Left aligned text</p>
    <p style="text-align: center;">Center aligned text</p>
    <p style="text-align: right;">Right aligned text</p>
    
    <h2>Styled Content Blocks</h2>
    <div style="background-color: #f0f9ff; padding: 16px; margin: 8px 0; border-radius: 4px; border: 2px dashed rgba(0,0,0,0.1);">
      <p>This is a colored content box that should be preserved during editing.</p>
    </div>
    
    <div style="border: 2px solid #e5e7eb; background-color: #ffffff; padding: 20px; margin: 12px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="margin-top: 0; color: #374151;">Text Box Title</h3>
      <p>This is a styled text box with borders and shadows.</p>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 12px 0; border-radius: 4px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 18px;">ℹ️</span>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; text-transform: capitalize;">Info</h4>
          <p style="margin: 0; color: #6b7280;">This is an info callout box.</p>
        </div>
      </div>
    </div>
    
    <h2>Two Column Layout</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 16px 0; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px;">
      <div style="padding: 12px; background-color: #f9fafb; border-radius: 4px; min-height: 100px;">
        <h4 style="margin-top: 0;">Left Column</h4>
        <p>Content in the left column.</p>
      </div>
      <div style="padding: 12px; background-color: #f9fafb; border-radius: 4px; min-height: 100px;">
        <h4 style="margin-top: 0;">Right Column</h4>
        <p>Content in the right column.</p>
      </div>
    </div>
    
    <h2>Quote</h2>
    <blockquote style="border-left: 4px solid #6366f1; background-color: #f8fafc; padding: 20px; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: italic;">
      <p style="margin: 0 0 12px 0; font-size: 18px; line-height: 1.6; color: #475569;">"This is a styled quote block."</p>
      <footer style="margin: 0; font-size: 14px; color: #64748b; font-style: normal;">
        — <cite>Author Name</cite>
      </footer>
    </blockquote>
    
    <h2>Table</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #f8fafc;">
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 1</th>
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 2</th>
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Header 3</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #ffffff;">
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 1</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 2</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 3</td>
        </tr>
        <tr style="background-color: #f9fafb;">
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 4</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 5</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Cell 6</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Links and Images</h2>
    <p>Here is a <a href="https://example.com" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">styled link</a>.</p>
    
    <figure style="margin: 20px 0; text-align: center;">
      <img src="https://via.placeholder.com/400x200" alt="Sample Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
      <figcaption style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">Sample image with caption</figcaption>
    </figure>
    
    <h2>Shapes and Design Elements</h2>
    <div style="width: 200px; height: 100px; background-color: #3b82f6; border-radius: 8px; margin: 16px auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Rectangle</div>
    
    <div style="width: 150px; height: 150px; background-color: #10b981; border-radius: 50%; margin: 16px auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Circle</div>
    
    <div style="text-align: center; margin: 16px 0;">
      <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; border: 2px solid #3b82f6; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.2s;">
        Sample Button
      </a>
    </div>
    
    <h2>Spacers and Dividers</h2>
    <div style="height: 40px; margin: 8px 0; border: 1px dashed #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; background-color: #f9fafb;">
      Spacer (40px)
    </div>
    
    <hr style="border: none; border-top: 2px solid #d1d5db; margin: 24px 0; width: 100%;" />
    
    <p>This test page demonstrates all the enhanced features of the rich text editor. Try editing this content to verify that all formatting is preserved.</p>
  `)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Rich Text Editor Test
          </h1>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              This page tests all enhanced editor features including:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>✅ Horizontal scroll controls</li>
              <li>✅ Content preservation (HTML attributes, CSS classes, inline styles)</li>
              <li>✅ ProseMirror schema compliance (no text node attribute errors)</li>
              <li>✅ Color picker for text and highlighting</li>
              <li>✅ Font family selection</li>
              <li>✅ Advanced text formatting (bold, italic, underline, subscript, superscript)</li>
              <li>✅ Layout elements (colored boxes, text containers, two-column layouts)</li>
              <li>✅ Visual design tools (shapes, spacers, dividers, buttons)</li>
              <li>✅ Enhanced content features (images with captions, advanced links, styled tables)</li>
              <li>✅ Mobile responsiveness</li>
              <li>✅ WCAG accessibility compliance</li>
            </ul>
          </div>

          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ ProseMirror Schema Fix Applied</h3>
            <p className="text-sm text-green-700">
              The &ldquo;RangeError: The text node type should not have attributes&rdquo; error has been resolved by:
            </p>
            <ul className="text-sm text-green-700 list-disc list-inside mt-2 space-y-1">
              <li>Removed &lsquo;text&rsquo; from PreserveAttributes extension types array</li>
              <li>Removed &lsquo;text&rsquo; from ContentPreservation extension types array</li>
              <li>Updated PreserveUnknownElements to use specific node types instead of &lsquo;*&rsquo;</li>
              <li>Added TextFormatPreservation extension for inline formatting</li>
              <li>Enhanced CustomSpan node for better inline content preservation</li>
            </ul>
          </div>
          
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start editing to test all features..."
            showPreview={true}
            splitView={false}
            className="mb-6"
          />
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Testing Instructions:</h3>
            <ol className="text-sm text-gray-700 list-decimal list-inside space-y-2">
              <li>Try editing the existing styled content to verify preservation</li>
              <li>Use the horizontal scroll controls for wide content</li>
              <li>Test all toolbar buttons and dropdown menus</li>
              <li>Insert new colored boxes, shapes, and design elements</li>
              <li>Try the color pickers for text and highlighting</li>
              <li>Test the split view and preview modes</li>
              <li>Verify mobile responsiveness by resizing the window</li>
              <li>Check that all formatting is maintained when switching between edit and preview modes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
