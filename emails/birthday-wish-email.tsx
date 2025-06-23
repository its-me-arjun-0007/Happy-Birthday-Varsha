import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components"

interface BirthdayWishEmailProps {
  name: string
  email: string
  message: string
}

export default function BirthdayWishEmail({ name, email, message }: BirthdayWishEmailProps) {
  const previewText = `New birthday wish from ${name}!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img src="https://i.imgur.com/vADKi3n.png" width="120" height="120" alt="Birthday Cake" style={logoImage} />
          </Section>
          <Heading style={h1}>You've received a birthday wish! 🎉</Heading>

          <Section style={birthdayCard}>
            <Heading as="h2" style={h2}>
              From: {name}
            </Heading>
            <Text style={messageText}>{message}</Text>
            <Text style={contactInfo}>Contact: {email}</Text>
            <Text style={sentInfo}>Sent on: {new Date().toLocaleDateString()}</Text>
          </Section>

          <Text style={footer}>This message was sent from your birthday website.</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#fff9fb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
}

const logoContainer = {
  marginTop: "32px",
  textAlign: "center" as const,
}

const logoImage = {
  margin: "0 auto",
}

const h1 = {
  color: "#ec4899",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#a855f7",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
}

const birthdayCard = {
  padding: "24px",
  backgroundColor: "white",
  borderRadius: "12px",
  border: "2px solid #fbcfe8",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
  margin: "20px 0",
}

const messageText = {
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0 24px",
  color: "#333",
  padding: "16px",
  backgroundColor: "#fdf2f8",
  borderRadius: "8px",
  fontStyle: "italic",
}

const contactInfo = {
  fontSize: "14px",
  color: "#666",
  margin: "8px 0",
}

const sentInfo = {
  fontSize: "14px",
  color: "#666",
  margin: "8px 0",
}

const footer = {
  color: "#898989",
  fontSize: "12px",
  marginTop: "24px",
  textAlign: "center" as const,
}
