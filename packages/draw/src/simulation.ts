import { GraphData } from '@mindgraph/types';
import { map } from 'd3-array';
import { GraphSimulationConfig, SimulationNode } from './types';
import {
  SimulationNodeDatum,
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  forceRadial,
  Simulation as D3Simulation,
} from 'd3-force';

export type ConfiguredSimulationLink = SimulationNodeDatum & {
  source: SimulationNode;
  target: SimulationNode;
};

export interface MindGraphSimulationArgs {
  data: GraphData;
  width: number;
  height: number;
  simulationConfig?: Partial<GraphSimulationConfig>;
}

export class Simulation {
  public readonly configuration: GraphSimulationConfig;
  public readonly nodes: SimulationNode[];
  public readonly links: ConfiguredSimulationLink[];

  constructor({
    data: { nodes, links },
    simulationConfig,
    width,
    height,
  }: MindGraphSimulationArgs) {
    this.nodes = map(nodes, merge_node_datum);
    this.links = map(
      links,
      merge_node_datum,
    ) as unknown as ConfiguredSimulationLink[];
    this.configuration = {
      ...default_simulation_config,
      ...simulationConfig,
    };
    this.simulation = this.build({ width, height });
  }

  public start(
    observers?: ((
      nodes: SimulationNode[],
      links: ConfiguredSimulationLink[],
    ) => void)[],
  ): void {
    this.simulation.on('tick', () => {
      observers?.forEach((f) => f(this.nodes, this.links));
    });
  }

  private simulation: D3Simulation<SimulationNode, undefined>;

  private build({
    width,
    height,
  }: BuildSimulationArgs): D3Simulation<SimulationNode, undefined> {
    const {
      initialClusterStrength,
      chargeStrength,
      linkStrength,
      centerStrength,
      radialStrength,
      alpha,
      alphaDecay,
      randomizeStartingPoints,
    } = this.configuration;

    // https://gist.github.com/mbostock/7881887
    this.nodes.forEach((node, i) => {
      const randomX = randomizeStartingPoints ? Math.random() : 0;
      const randomY = randomizeStartingPoints ? Math.random() : 0;
      node.x =
        Math.cos((i / initialClusterStrength) * 2 * Math.PI) * 200 +
        width / 2 +
        randomX;
      node.y =
        Math.sin((i / initialClusterStrength) * 2 * Math.PI) * 200 +
        height / 2 +
        randomY;
    });
    console.log(this.links);
    return forceSimulation(this.nodes)
      .force('charge', forceManyBody().strength(chargeStrength))
      .force(
        'center',
        forceCenter(width / 2, height / 2).strength(centerStrength),
      )
      .force(
        'link',
        forceLink(this.links)
          .id((l) => (l as SimulationNode).id)
          .strength(linkStrength),
      )
      .force("radial", forceRadial(200, width / 2, height / 2).strength(radialStrength))
      .alpha(alpha)
      .alphaDecay(alphaDecay);
  }
}

type BuildSimulationArgs = {
  width: number;
  height: number;
};

function merge_node_datum<TDatum extends Record<string, string | number>>(
  datum: TDatum,
) {
  return {
    ...empty_node_datum,
    ...datum,
  };
}

const empty_node_datum = {
  index: undefined,
  x: undefined,
  y: undefined,
  vx: undefined,
  vy: undefined,
  fx: undefined,
  fy: undefined,
};

// const default_simulation_config: GraphSimulationConfig = {
//   chargeStrength: -400,
//   centerStrength: 1.4,
//   linkStrength: 9,
//   radialStrength: 0.9,
//   alpha: 0.3,
//   alphaDecay: 0.1,
//   initialClusterStrength: 9,
// };

const default_simulation_config: GraphSimulationConfig = {
  chargeStrength: -160,   // Increased repulsion to spread nodes out more
  centerStrength: 0.1,    // Lowered to reduce the pull to the exact center
  linkStrength: 0.4,      // Lowered to allow more flexibility in node placement
  alpha: 1,               // Higher initial alpha for more movement early on
  alphaDecay: 0.02,       // Slower decay to let the simulation run longer
  initialClusterStrength: 10,  // Can be adjusted based on your clustering needs
  radialStrength: 0.8     // Strength of the radial force (if used)
};