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

interface CommentNotificationEmailProps {
  authorName: string;
  postTitle: string;
  commentContent: string;
  postUrl: string;
}

export default function CommentNotificationEmail({
  authorName,
  postTitle,
  commentContent,
  postUrl,
}: CommentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>New Comment on Your Post</Text>
            <Text style={paragraph}>
              <strong>{authorName}</strong> commented on your post{" "}
              <strong>{postTitle}</strong>:
            </Text>
            <Section style={commentBox}>
              <Text style={commentText}>{commentContent}</Text>
            </Section>
            <Button style={button} href={postUrl}>
              View Comment
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              You&apos;re receiving this because you&apos;re the author of this post.
            </Text>
            <Text style={footer}>
              <Link href={postUrl} style={link}>
                Unsubscribe from notifications
              </Link>
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

const commentBox = {
  backgroundColor: "#f4f4f4",
  borderLeft: "4px solid #000000",
  padding: "16px",
  margin: "24px 0",
};

const commentText = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#484848",
  fontStyle: "italic",
  margin: "0",
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

const link = {
  color: "#556cd6",
  textDecoration: "underline",
};
