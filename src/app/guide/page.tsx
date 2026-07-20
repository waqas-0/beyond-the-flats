import { redirect } from "next/navigation";

// The old static demo profile lived here. The real visitor experience is the
// dynamic guide directory (/guides) and each guide's live profile (/g/[id]),
// so this route just forwards there — no mock data is ever served.
export default function GuideIndexPage() {
  redirect("/guides");
}
