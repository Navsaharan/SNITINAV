'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, ExternalLink } from 'lucide-react'
import FeedbackForm from '@/components/forms/feedback-form'

interface ContentRendererProps {
  content: string
  type?: string
  data?: string | null
}

interface TableData {
  headers: string[]
  rows: string[][]
}

interface ListData {
  items: string[]
  ordered?: boolean
}

interface ContactData {
  name?: string
  title?: string
  phone?: string
  email?: string
  address?: string
}

interface DownloadData {
  title: string
  description?: string
  url: string
  fileType?: string
  fileSize?: string
}

interface ImageData {
  url: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}

interface GalleryData {
  images: ImageData[]
}

export default function ContentRenderer({ content, type = 'HTML', data }: ContentRendererProps) {
  // Parse JSON data if provided
  let parsedData: unknown = null
  if (data) {
    try {
      parsedData = JSON.parse(data)
    } catch (error) {
      console.error('Error parsing content data:', error)
    }
  }

  // Initialize slideshow state for all components to avoid conditional hooks
  const [currentSlide, setCurrentSlide] = useState(0)

  switch (type) {
    case 'TEXT':
      return (
        <div className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {content}
        </div>
      )

    case 'HTML':
      return (
        <div
          className="prose prose-lg max-w-none prose-table:text-sm"
          style={{
            '--tw-prose-headings': 'var(--color-text-primary)',
            '--tw-prose-body': 'var(--color-text-primary)',
            '--tw-prose-links': 'var(--color-primary)',
            '--tw-prose-bold': 'var(--color-text-primary)',
            '--tw-prose-quotes': 'var(--color-text-secondary)',
            '--tw-prose-quote-borders': 'var(--color-border)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border)',
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )

    case 'IMAGE':
      if (parsedData && typeof parsedData === 'object' && 'url' in parsedData) {
        const imageData = parsedData as ImageData
        return (
          <div className="my-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageData.url}
                alt={imageData.alt || 'Image'}
                width={imageData.width || 800}
                height={imageData.height || 600}
                className="w-full h-auto"
              />
            </div>
            {imageData.caption && (
              <p className="text-sm text-gray-600 text-center mt-2 italic">
                {imageData.caption}
              </p>
            )}
          </div>
        )
      }
      return null

    case 'GALLERY':
      if (parsedData && typeof parsedData === 'object' && 'images' in parsedData) {
        const galleryData = parsedData as GalleryData
        return (
          <div className="my-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryData.images.map((image: ImageData, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Image
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-75 text-white p-2">
                      <p className="text-sm">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }
      return null

    case 'SLIDESHOW':
      if (parsedData && typeof parsedData === 'object' && 'images' in parsedData) {
        const galleryData = parsedData as GalleryData
        const images = galleryData.images

        return (
          <div className="my-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 sm:h-80 lg:h-96">
                <Image
                  src={images[currentSlide].url}
                  alt={images[currentSlide].alt || `Slide ${currentSlide + 1}`}
                  fill
                  className="object-cover"
                />
                {images[currentSlide].caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                    <p>{images[currentSlide].caption}</p>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    →
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }
      return null

    case 'TABLE':
      if (parsedData as TableData) {
        const tableData = parsedData as TableData
        return (
          <div className="my-6 overflow-x-auto">
            <table
              className="min-w-full divide-y rounded-lg border"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              {tableData.headers && (
                <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <tr>
                    {tableData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y" style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)'
              }}>
                {tableData.rows?.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    style={{
                      backgroundColor: rowIndex % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)'
                    }}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      return null

    case 'LIST':
      if (parsedData as ListData) {
        const listData = parsedData as ListData
        const ListComponent = listData.ordered ? 'ol' : 'ul'
        return (
          <div className="my-6">
            <ListComponent className={`space-y-2 ${listData.ordered ? 'list-decimal' : 'list-disc'} list-inside`}>
              {listData.items?.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed">
                  {item}
                </li>
              ))}
            </ListComponent>
          </div>
        )
      }
      return null

    case 'CONTACT_INFO':
      if (parsedData as ContactData) {
        const contactData = parsedData as ContactData
        return (
          <div className="my-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {contactData.name && (
                <div>
                  <span className="font-medium text-gray-900">Name: </span>
                  <span className="text-gray-700">{contactData.name}</span>
                </div>
              )}
              {contactData.title && (
                <div>
                  <span className="font-medium text-gray-900">Title: </span>
                  <span className="text-gray-700">{contactData.title}</span>
                </div>
              )}
              {contactData.phone && (
                <div>
                  <span className="font-medium text-gray-900">Phone: </span>
                  <a href={`tel:${contactData.phone}`} className="text-blue-600 hover:text-blue-800">
                    {contactData.phone}
                  </a>
                </div>
              )}
              {contactData.email && (
                <div>
                  <span className="font-medium text-gray-900">Email: </span>
                  <a href={`mailto:${contactData.email}`} className="text-blue-600 hover:text-blue-800">
                    {contactData.email}
                  </a>
                </div>
              )}
              {contactData.address && (
                <div>
                  <span className="font-medium text-gray-900">Address: </span>
                  <span className="text-gray-700">{contactData.address}</span>
                </div>
              )}
            </div>
          </div>
        )
      }
      return null

    case 'DOWNLOAD':
      if (parsedData as DownloadData) {
        const downloadData = parsedData as DownloadData
        return (
          <div className="my-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{downloadData.title}</h4>
                  {downloadData.description && (
                    <p className="text-sm text-gray-600 mt-1">{downloadData.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {downloadData.fileType && (
                      <span className="uppercase font-medium">{downloadData.fileType}</span>
                    )}
                    {downloadData.fileSize && (
                      <span>{downloadData.fileSize}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={downloadData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                  <a
                    href={downloadData.url}
                    download
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
      }
      return null

    case 'FEEDBACK_FORM':
      return (
        <div className="my-6">
          <FeedbackForm />
        </div>
      )

    default:
      // Fallback to HTML rendering
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
  }
}
