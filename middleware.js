export {default} from "next-auth/middleware"

export const config = { matcher: ["/home","/artists/:path*","/creators/:path*"] }