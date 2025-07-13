import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user account
    const { data: account } = await supabase
      .from('account')
      .select('account_id')
      .eq('email', user.email)
      .single()
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
    }

    // Validate file size
    const maxSize = file.type === 'application/pdf' ? 25 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = file.type === 'application/pdf' ? 25 : 10
      return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}MB` }, { status: 400 })
    }

    // Generate file hash for duplicate detection
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    // Check for duplicate files by the same user
    const { data: existingAsset } = await supabase
      .from('asset')
      .select('id, filename, path, original')
      .eq('hash', hash)
      .eq('uploader', account.account_id)
      .single()

    if (existingAsset) {
      return NextResponse.json({
        success: true,
        asset: existingAsset,
        message: 'File already exists'
      })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const timestamp = Date.now()
    const randomStr = crypto.randomBytes(8).toString('hex')
    const filename = `${timestamp}_${randomStr}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filepath = join(uploadDir, filename)
    const publicPath = `/uploads/${filename}`

    // Save file to disk
    try {
      await writeFile(filepath, buffer)
      console.log('✅ File saved to:', filepath)
    } catch (error) {
      console.error('❌ File write error:', error)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    // Get image dimensions if it's an image (optional - you can add image processing library later)
    let width = null, height = null
    if (file.type.startsWith('image/')) {
      // TODO: Use sharp or another library to get dimensions
      // For now, we'll leave them null
    }

    // Create asset record in database
    const { data: asset, error: assetError } = await supabase
      .from('asset')
      .insert([{
        filename,
        original: file.name,
        path: publicPath,
        size: file.size,
        mimetype: file.type,
        hash,
        uploader: account.account_id,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        width,
        height,
        status: 'ready',
        public: false
      }])
      .select()
      .single()

    if (assetError) {
      console.error('❌ Database error:', assetError)
      return NextResponse.json({ error: 'Failed to create asset record' }, { status: 500 })
    }

    console.log('✅ Asset created successfully:', asset.id)

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        filename: asset.filename,
        original: asset.original,
        path: asset.path,
        size: asset.size,
        type: asset.type,
        created: asset.created
      }
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}