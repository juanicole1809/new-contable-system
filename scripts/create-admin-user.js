require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const email = 'juani.colella@gmail.com'
  const password = 'Talarga.1993'

  console.log(`Creating admin user: ${email}`)

  // Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    process.exit(1)
  }

  const existingUser = users.find(u => u.email === email)

  if (existingUser) {
    console.log(`User ${email} already exists with ID: ${existingUser.id}`)
    console.log('No changes made.')
    process.exit(0)
  }

  // Create the user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      name: 'Juan Colella',
    },
  })

  if (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin user created successfully!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`User ID: ${data.user.id}`)
  console.log('\nYou can now log in at /login')
}

createAdminUser()
