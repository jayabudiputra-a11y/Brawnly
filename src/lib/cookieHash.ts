export async function cookieHashQuarter(input: string) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);

  return Array.from(new Uint8Array(hash))
    .slice(0, 8) // 1/4 memory footprint
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}
