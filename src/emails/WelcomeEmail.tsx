import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Welcome to Second Brain! 🎉</Text>
            <Text style={paragraph}>
              Hi {name || "there"},
            </Text>
            <Text style={paragraph}>
              Thank you for joining our community! We&apos;re excited to have you here.
            </Text>
            <Text style={paragraph}>
              Second Brain is your personal knowledge management system. Here&apos;s what
              you can do:
            </Text>
            <ul style={list}>
              <li style={listItem}>📚 Read insightful articles</li>
              <li style={listItem}>💬 Engage in discussions</li>
              <li style={listItem}>🔖 Bookmark your favorites</li>
              <li style={listItem}>📊 Track your reading history</li>
            </ul>
            <Button style={button} href={process.env.NEXTAUTH_URL || "http://localhost:3000"}>
              Start Exploring
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              If you have any questions, feel free to reach out to us.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
  padding: "12px 0",
};

const list = {
  fontSize: "18px",
  lineHeight: "1.6",
  color: "#484848",
  paddingLeft: "20px",
};

const listItem = {
  padding: "8px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "14px 20px",
  marginTop: "24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "18px",
};
