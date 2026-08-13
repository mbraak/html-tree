export interface DemoNodeData {
  children?: DemoNodeData[];
  id: number;
  load_on_demand?: boolean;
  name: string;
}

// The dinosaur tree from the devserver example.
export const exampleData: DemoNodeData[] = [
  {
    children: [
      { id: 2, name: "Herrerasaurians" },
      {
        children: [
          { id: 4, name: "Coelophysoids" },
          { id: 5, name: "Ceratosaurians" },
          { id: 6, name: "Spinosauroids" },
          { id: 7, name: "Carnosaurians" },
          {
            children: [
              { id: 9, name: "Tyrannosauroids" },
              { id: 10, name: "Ornithomimosaurians" },
              { id: 11, name: "Therizinosauroids" },
              { id: 12, name: "Oviraptorosaurians" },
              { id: 13, name: "Dromaeosaurids" },
              { id: 14, name: "Troodontids" },
              { id: 15, name: "Avialans" },
            ],
            id: 8,
            name: "Coelurosaurians",
          },
        ],
        id: 3,
        name: "Theropods",
      },
      {
        children: [
          { id: 17, name: "Prosauropods" },
          {
            children: [
              { id: 19, name: "Diplodocoids" },
              {
                children: [
                  { id: 21, name: "Brachiosaurids" },
                  { id: 22, name: "Titanosaurians" },
                ],
                id: 20,
                name: "Macronarians",
              },
            ],
            id: 18,
            name: "Sauropods",
          },
        ],
        id: 16,
        name: "Sauropodomorphs",
      },
    ],
    id: 1,
    name: "Saurischia",
  },
  {
    children: [
      { id: 24, name: "Heterodontosaurids" },
      {
        children: [
          { id: 26, name: "Ankylosaurians" },
          { id: 27, name: "Stegosaurians" },
        ],
        id: 25,
        name: "Thyreophorans",
      },
      {
        children: [{ id: 29, name: "Hadrosaurids" }],
        id: 28,
        name: "Ornithopods",
      },
      { id: 30, name: "Pachycephalosaurians" },
      { id: 31, name: "Ceratopsians" },
    ],
    id: 23,
    name: "Ornithischians",
  },
];

// A shorter tree, for demos where the point is not the data.
export const smallData: DemoNodeData[] = [
  {
    children: [
      { id: 2, name: "Ankylosaurians" },
      { id: 3, name: "Stegosaurians" },
    ],
    id: 1,
    name: "Thyreophorans",
  },
  {
    children: [{ id: 5, name: "Hadrosaurids" }],
    id: 4,
    name: "Ornithopods",
  },
  { id: 6, name: "Ceratopsians" },
];

// Deep copy, so a demo can never hand its data to another demo.
export const copyData = (data: DemoNodeData[]): DemoNodeData[] =>
  data.map((node) => ({
    ...node,
    ...(node.children ? { children: copyData(node.children) } : {}),
  }));
