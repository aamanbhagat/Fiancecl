import fs from 'fs';
import path from 'path';

export function getBlogPosts() {
  const blogDir = path.join(process.cwd(), 'app/blog');
  const directories = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'components')
    .map(dirent => dirent.name);

  // Filter out non-blog directories
  const blogPosts = directories.filter(dir => {
    const fullPath = path.join(blogDir, dir, 'page.tsx');
    return fs.existsSync(fullPath);
  });

  return blogPosts;
}