import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }} >
      <div style={{ width: "50%", height: "20%", backgroundColor: "#ffeded", borderRadius: 12, padding: 12, textAlign: "center" }}>
        <h1>Not Found</h1>
        <p>Could not find requested resource</p>
        <Link href="/">Return Home</Link>
      </div>
    </div>
  )
}