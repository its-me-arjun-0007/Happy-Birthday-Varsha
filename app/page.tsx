import type { Metadata } from "next"
import ClientComponent from "./ClientComponent"

export const metadata: Metadata = {
  title: "Happy Birthday Varsha!",
  description: "A special birthday celebration for Varsha",
}

export default function HomePage() {
  return <ClientComponent />
}
