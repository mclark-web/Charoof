import { SITE_URL } from "./site-urls";

const EXPIRES = "2027-10-22T23:59:59.000Z";

export function securityTxt(origin = SITE_URL): string {
  return [
    `Contact: ${origin}/contact`,
    `Expires: ${EXPIRES}`,
    "Preferred-Languages: en",
    `Canonical: ${origin}/.well-known/security.txt`,
    `Policy: ${origin}/disclaimer`,
    "",
  ].join("\n");
}
