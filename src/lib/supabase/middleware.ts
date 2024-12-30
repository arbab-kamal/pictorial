import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// THIS MIDDLEWARE IS LITTLE BIT MODIFIED FROM THE ORIGINAL ONE, THIS IS MORE EFFICIENT

// Define protected and public routes
const PROTECTED_ROUTES = [
  '/dashboard',
  '/image-generation',
  '/model-training',
  '/gallery',
  '/billing',
  '/account-settings',
  '/models',
  '/reset-password',
  // Add more protected routes here
]

const PUBLIC_ROUTES = [
  '/login',
  '/auth',
  // '/reset-password',
  // Add more public routes here
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value
            // options
         }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  const isAuthRoute = PUBLIC_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

   // Handle authentication logic
   if (!user && isProtectedRoute) {
    // Redirect to login if accessing protected route without auth
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.url)
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from the original response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from the original response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}