import type React from "react"

interface BirthdayWishProps {
  name: string
  email: string
  message: string
}

export const BirthdayWish: React.FC<BirthdayWishProps> = ({ name, email, message }) => {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>Message: {message}</p>
    </div>
  )
}
