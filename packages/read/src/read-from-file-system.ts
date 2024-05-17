import { GraphData } from '@mindgraph/types';
import * as fs from 'fs';
import * as readline from 'node:readline';
import {
  HIDDEN_FILES_REGEX,
  LINK_CONTENT_REGEX,
  MARKDOWN_EXTENSION,
} from './constants';

export async function readFromFileSystem(path: string): Promise<GraphData> {
  return build_graph(path);
}

export async function readFromFileSystemWithFilter(path: string, filter: string): Promise<GraphData> {
  return build_graph_with_filter(path, filter);
}

async function build_graph(
  path: string,
  graph: GraphData = { nodes: [], links: [] },
): Promise<GraphData> {
  const dir = await fs.promises.opendir(path);

  for await (const dirent of dir) {
    await add_dirent_to_graph(path, dirent, graph);
  }

  return graph;
}
async function build_graph_with_filter(
  path: string,
  filter: string = '',
  graph: GraphData = { nodes: [], links: [] },
): Promise<GraphData> {
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (dirent.name.includes(filter)) {
      await add_dirent_to_graph(path, dirent, graph);
    }
  }
  // add linked nodes
  let targetDirent: fs.Dirent | undefined;
  for await (const li of graph.links) {
      const target_path = li.target;
      // const source_path = li.source;
      const dir2 = await fs.promises.opendir(path);
      for await (const dirent of dir2) {
          if (dirent.name === target_path.split('/')[target_path.split('/').length - 1]) {
          targetDirent = dirent;
          break;
        }
      }
      // const dirent = await fs.promises.opendir(path);
      const node_ids  = graph.nodes.map(node => node.id);
      if (targetDirent && !node_ids.includes(li.target)) {
        await add_dirent_to_graph(path, targetDirent, graph);
      }
    }

  return graph;
}  

async function add_dirent_to_graph(
  path: string,
  dirent: fs.Dirent,
  graph: GraphData,
) {
  if (HIDDEN_FILES_REGEX.test(dirent.name)) return;

  const direntPath = decodeURIComponent(`${path}/${dirent.name}`);

  if (dirent.isDirectory()) {
    await build_graph(direntPath, graph);
  } else if (dirent.isFile()) {
    const linkCount = await add_links_to_graph(direntPath, graph);
    graph.nodes.push({
      id: direntPath,
      name: dirent.name,
      linkCount,
    });
  }
}

async function add_links_to_graph(
  filePath: string,
  graph: GraphData,
): Promise<number> {
  let linkCount = 0;

  const fileStream = fs.createReadStream(filePath);
  const lines = readline.createInterface({ input: fileStream });

  for await (const line of lines) {
    const links = line.match(LINK_CONTENT_REGEX) || [];

    for (const link of links) {
      const path = LINK_CONTENT_REGEX.exec(link)?.at(1);

      if (is_valid_link_path(path)) {
        linkCount++;

        const linkDirections = path.split('/');
        const pathToTargetFile = filePath.split('/');

        pathToTargetFile.pop();

        for (const direction of linkDirections) {
          switch (direction) {
            case '.':
              break;
            case '..':
              pathToTargetFile.pop();
              break;
            default:
              pathToTargetFile.push(direction);
          }
        }

        graph.links.push({
          source: decodeURIComponent(filePath),
          target: decodeURIComponent(pathToTargetFile.join('/')),
        });
      }
    }
  }

  return linkCount;
}

function is_valid_link_path(path: string | undefined): path is string {
  return !!(path && !path.includes('://') && path.includes(MARKDOWN_EXTENSION));
}
