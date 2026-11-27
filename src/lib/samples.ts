/**
 * Sample photos from the VITON-HD research dataset, as bundled with the IDM-VTON demo
 * (https://huggingface.co/spaces/yisol/IDM-VTON). Licence: CC BY-NC-SA 4.0, non-commercial use.
 */
export type Sample = { src: string; label: string };

export const SAMPLE_MODELS: Sample[] = [1, 2, 3, 4, 5].map((n) => ({ src: `/samples/models/model-${n}.jpg`, label: `Sample model ${n}` }));

export const SAMPLE_CLOTHES: Sample[] = [
  { src: "/samples/clothes/top-1.jpg", label: "Teal velvet wrap top" },
  { src: "/samples/clothes/top-2.jpg", label: "Chain-print blouse" },
  { src: "/samples/clothes/top-3.jpg", label: "White ribbed cami" },
  { src: "/samples/clothes/top-4.jpg", label: "Two-tone polo" },
  { src: "/samples/clothes/top-5.jpg", label: "Red tie-waist tee" },
  { src: "/samples/clothes/top-6.jpg", label: "Black cropped wrap top" },
];

/** Results made in advance with IDM-VTON, shown only when every model is unavailable. */
export const DEMO_RESULTS = [
  { before: "/samples/models/model-1.jpg", after: "/demo/model-1-top-1.png", label: "Teal velvet wrap top" },
  { before: "/samples/models/model-3.jpg", after: "/demo/model-3-top-5.png", label: "Red tie-waist tee" },
];
