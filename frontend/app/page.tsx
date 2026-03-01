import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Conversational E-commerce</h1>
      <Link href="/chat">Start chatting</Link>
    </main>
  );
}
