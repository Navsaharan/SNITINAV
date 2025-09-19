# Image Management System Guide

## Overview

The SNPITC website includes a comprehensive image management system that allows administrators to upload, organize, and manage institutional images with ease. This system includes both general media management and a specialized placeholder replacement system for key institutional images.

## Features

### 1. General Media Management (`/admin/media`)
- **Upload multiple files** with drag-and-drop support
- **Category-based organization** (Faculty, Infrastructure, Events, Gallery, Documents, Certificates, Achievements)
- **Advanced filtering** by file type and category
- **Search functionality** across filenames, alt text, and tags
- **Professional lightbox** with zoom, pan, and keyboard navigation
- **Grid and list view modes** for different viewing preferences
- **Bulk operations** and file management

### 2. Image Placeholder Management (`/admin/images`)
- **Predefined placeholders** for key institutional images
- **Easy replacement** of placeholder images with uploaded content
- **Category organization** by image type
- **Visual preview** of current and placeholder images
- **Dimension specifications** for optimal image sizing

## Predefined Image Placeholders

### Faculty Images
1. **Principal Photo** (300x400px)
   - Key: `faculty_principal`
   - Usage: Principal's profile photo on faculty page
   
2. **Senior Instructor** (300x400px)
   - Key: `faculty_instructor_1`
   - Usage: Senior instructor profile photo

### Infrastructure Images
3. **Main Building** (800x600px)
   - Key: `infrastructure_main_building`
   - Usage: Institute exterior view
   
4. **Workshop Area** (800x600px)
   - Key: `infrastructure_workshop`
   - Usage: Electrician workshop and training facilities
   
5. **Computer Lab** (800x600px)
   - Key: `infrastructure_computer_lab`
   - Usage: Computer lab with modern equipment
   
6. **Library** (800x600px)
   - Key: `infrastructure_library`
   - Usage: Library with books and study area

### Event Images
7. **Annual Function** (800x600px)
   - Key: `events_annual_function`
   - Usage: Annual function and cultural events

### Achievement Images
8. **Achievement Certificates** (600x400px)
   - Key: `achievements_certificates`
   - Usage: Student achievement certificates and awards

## How to Upload and Manage Images

### Step 1: Access Admin Panel
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Go to either:
   - `/admin/media` for general media management
   - `/admin/images` for placeholder management

### Step 2: Upload Images

#### General Media Upload:
1. Click "Upload Media" button
2. Select category (Faculty, Infrastructure, Events, etc.)
3. Add tags for better organization
4. Provide alt text for accessibility
5. Add optional caption
6. Drag and drop files or click to select
7. Click "Upload" to process files

#### Placeholder Replacement:
1. Go to `/admin/images`
2. Find the placeholder you want to replace
3. Click "Upload Image" or "Replace Image"
4. Select appropriate image from media library
5. Or upload new image directly
6. Image will automatically replace the placeholder

### Step 3: Organize and Filter
- Use **search bar** to find specific images
- **Filter by category** to view related images
- Switch between **grid and list views**
- **Sort by name, date, or size**

### Step 4: Use Lightbox Features
- Click any image to open in lightbox
- **Zoom in/out** with + and - keys or buttons
- **Pan around** when zoomed by dragging
- **Navigate** with arrow keys or buttons
- **Download** images directly from lightbox
- **View thumbnails** at bottom for quick navigation

## Image Categories

### FACULTY
- Principal photos
- Instructor profiles
- Staff portraits
- Faculty group photos

### INFRASTRUCTURE
- Building exteriors and interiors
- Workshop areas
- Classroom facilities
- Laboratory equipment
- Library spaces

### EVENTS
- Annual functions
- Cultural programs
- Sports events
- Graduation ceremonies
- Workshops and seminars

### GALLERY
- General institutional photos
- Student activities
- Campus life
- Miscellaneous images

### DOCUMENTS
- Certificates
- Official documents
- Brochures
- Forms and applications

### CERTIFICATES
- Achievement certificates
- Accreditation documents
- Awards and recognitions

### ACHIEVEMENTS
- Student achievements
- Institutional awards
- Competition results
- Success stories

## Best Practices

### Image Quality
- **Use high-resolution images** for better quality
- **Maintain aspect ratios** as specified for placeholders
- **Optimize file sizes** (recommended: under 2MB per image)
- **Use descriptive filenames** for better organization

### Accessibility
- **Always provide alt text** describing the image content
- **Use meaningful captions** when applicable
- **Ensure good contrast** in images with text
- **Consider color-blind users** when selecting images

### Organization
- **Use appropriate categories** for easy filtering
- **Add relevant tags** for better searchability
- **Use consistent naming conventions**
- **Regularly review and clean up** unused images

### SEO Optimization
- **Use descriptive alt text** for search engines
- **Include relevant keywords** in image descriptions
- **Optimize file sizes** for faster loading
- **Use appropriate file formats** (JPEG for photos, PNG for graphics)

## Technical Specifications

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF
- **Maximum file size**: 10MB per file
- **Multiple uploads**: Supported

### Recommended Dimensions
- **Faculty photos**: 300x400px (portrait orientation)
- **Infrastructure photos**: 800x600px (landscape orientation)
- **Event photos**: 800x600px (landscape orientation)
- **Achievement certificates**: 600x400px (landscape orientation)

### Storage
- Images are stored in `/public/uploads/` directory
- Database records include metadata and file information
- Placeholder configurations stored in settings table

## Troubleshooting

### Common Issues

**Upload fails:**
- Check file size (must be under 10MB)
- Verify file type is supported
- Ensure stable internet connection

**Image not displaying:**
- Verify file path is correct
- Check file permissions
- Clear browser cache

**Lightbox not working:**
- Ensure JavaScript is enabled
- Check for browser compatibility
- Refresh the page

**Placeholder not updating:**
- Verify admin permissions
- Check if image was properly selected
- Try refreshing the page

### Support
For technical support or questions about the image management system, contact the system administrator or refer to the main documentation.

## API Endpoints

### Media Management
- `GET /api/media` - List all media files
- `POST /api/media` - Upload new media file
- `DELETE /api/media/[id]` - Delete media file

### Placeholder Management
- `GET /api/placeholders` - Get placeholder configurations
- `PUT /api/placeholders` - Update placeholder image
- `DELETE /api/placeholders` - Reset placeholder to default

---

*Last updated: June 2025*
