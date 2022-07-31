import type { JwtPayload } from 'jsonwebtoken'

export interface UserToken extends JwtPayload {
  id: number
}
