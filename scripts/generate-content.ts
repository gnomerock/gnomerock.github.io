import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface ContentItem {
  slug: string;
  dir: string;
  extension: string;
  title?: string;
  description?: string;
  body: string;
}

const contentDirectory = path.join(process.cwd(), "content");
const outputFile = path.join(process.cwd(), "public", "content.json");

function getAllMarkdownFiles(
  dir: string,
  baseDir: string = ""
): ContentItem[] {
  const items: ContentItem[] = [];

  if (!fs.existsSync(dir)) {
    return items;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      items.push(...getAllMarkdownFiles(fullPath, relativePath));
    } else if (entry.name.endsWith(".md")) {
      const fileContent = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = matter(fileContent);
      const slug = entry.name.replace(/\.md$/, "");
      const dirPath = baseDir ? `/${baseDir}` : "/";

      items.push({
        slug,
        dir: dirPath,
        extension: ".md",
        title: data.title,
        description: data.description,
        body: content.trim(),
      });
    }
  }

  return items;
}

function main() {
  console.log("Generating content.json...");
  const allContent = getAllMarkdownFiles(contentDirectory);
  
  // Ensure public directory exists
  const publicDir = path.dirname(outputFile);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(allContent, null, 2));
  console.log(`Generated ${outputFile} with ${allContent.length} items`);
}

main();
