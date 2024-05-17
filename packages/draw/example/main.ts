import { GraphData } from '@mindgraph/types';
import { MindGraph } from '../src/mindgraph';
import {marked} from 'marked';

document.addEventListener('DOMContentLoaded', async () => {

  const canvas = document.getElementById('app') as HTMLCanvasElement;

  if (!canvas) {
    alert('no canvas found in html body');
    return;
  }

  try {

    const data: GraphData = await fetch('/api/notes').then((response) =>
      response.json(),
    );
    const mg: MindGraph = new MindGraph({
      data,
      canvas,
    });
    // TODO: change click event
    mg.onClick( async (node) => {
      // TODO: fetch markdown file in subdir
      const response = await fetch('/example/cards_full/' + node.name);
      const markdown = await response.text();
      const html = marked(markdown);
      const block = document.getElementById('markdown-block');
      if (block) {
        block.innerHTML = html;
      }
    });
    mg.draw();
  } catch (error) {
    alert(error);
  }
});

document.getElementById('input-field')?.addEventListener('input', async (event) => {
  // fetch('/api/notes')
  // .then(response => response.json())
  // .then(data => {
      const inputElement = event.target; // This will be the input field element

      const inputValue = inputElement?inputElement.value: ''; // Get the current value of the input field
      const encodedInput = encodeURIComponent(inputValue);
      const canvas = document.getElementById('app') as HTMLCanvasElement;

      if (!canvas) {
        alert('no canvas found in html body');
        return;
      }
      if (encodedInput === '') {
        return;
      }
      try {
        const data: GraphData = await fetch(`/api/notes2?query=${encodedInput}`).then((response) =>
          response.json(),
        );
        const mg: MindGraph = new MindGraph({
          data,
          canvas,
        });
        // TODO: change click event
        console.log('node.name');

        // mg.onClick((node) => alert(node.name));
        mg.onClick( async (node) => {
          const response = await fetch('/example/cards_full/' + node.name);
          const markdown = await response.text();
          const html = marked(markdown);
          const block = document.getElementById('markdown-block');
          if (block) {
            block.innerHTML = html;
          }
        });
        mg.draw();
      } catch (error) {
        alert(error);
      }
  // })
  // .catch(error => console.error('Error fetching data:', error));
});
