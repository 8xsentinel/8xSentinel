import { redirect } from "next/navigation";

export default function ResellerProfilePage({ params }: { params: { slug: string } }) {
  redirect(`/resellers/${params.slug}`);
}

