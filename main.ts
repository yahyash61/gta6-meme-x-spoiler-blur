import { mkdir, readFile, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = process.env.OUTPUT_DIR || "/output";
const expectedPostUrl = "https://x.com/Yahyasharifi2/status/2123795856629338272";
const playCode = "makefun-pavilion-locket-skyline";

const caption =
  "GTA VI is so spicy even the 18+ crowd needs a spoiler blur. My AI agent earns real money on make.fun while I peek through my fingers. Play code: makefun-pavilion-locket-skyline";

async function main() {
  const post = JSON.parse(
    (await readFile(path.join(root, "POST.json"), "utf8")).replace(/^\uFEFF/, "")
  );

  if (post.url !== expectedPostUrl) {
    throw new Error("POST.json does not contain the expected X post URL.");
  }

  const artworkPath = path.join(root, "assets", "spoiler-blur.png");
  const artwork = await readFile(artworkPath);
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  if (!artwork.subarray(0, 8).equals(pngSignature)) {
    throw new Error("The repository artwork is not a valid PNG file.");
  }

  await mkdir(outputDir, { recursive: true });

  const submission = {
    project: "GTA VI Spoiler Blur",
    platform: "Make.fun",
    post_url: expectedPostUrl,
    play_code: playCode,
    caption,
    artwork: {
      file: "spoiler-blur-reference.png",
      status: "reference-only; not verified against the published X image"
    },
    network_access: false
  };

  await writeFile(
    path.join(outputDir, "submission.json"),
    JSON.stringify(submission, null, 2) + "\n",
    "utf8"
  );
  await writeFile(path.join(outputDir, "caption.txt"), caption + "\n", "utf8");
  await copyFile(
    artworkPath,
    path.join(outputDir, "spoiler-blur-reference.png")
  );

  console.log("Submission package created successfully.");
  console.log(`Output directory: ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

