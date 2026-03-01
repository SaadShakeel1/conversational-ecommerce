export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <main>
      {/* TODO: product detail, specs, reviews, related */}
      <p>Product {params.id}</p>
    </main>
  );
}
