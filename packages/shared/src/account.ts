import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  roles: z.array(z.string()),
})

export type User = z.infer<typeof UserSchema>
