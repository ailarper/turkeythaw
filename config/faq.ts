export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'thaw-time-per-pound',
    question: 'How long to thaw a turkey per pound?',
    answer:
      'According to USDA guidelines, refrigerator thawing requires approximately 24 hours for every 4.5 to 5 pounds of whole turkey at 40°F (4°C), which equals about 5.33 hours per pound. For cold-water thawing, allow 30 minutes per pound submerged in cold tap water, refreshing the water every 30 minutes.',
  },
  {
    id: 'thaw-on-counter',
    question: 'Can I thaw a turkey on the counter at room temperature?',
    answer:
      'No, never thaw a frozen turkey on the counter, in the garage, or in warm water. Bacteria such as Salmonella and Campylobacter multiply rapidly in the "Danger Zone" between 40°F and 140°F (4°C to 60°C). While the interior of the turkey remains frozen, the outer meat warms up to room temperature, creating severe food poisoning risks.',
  },
  {
    id: 'thaw-time-20-lb',
    question: 'What is the thaw time for a 20 lb turkey?',
    answer:
      'In a refrigerator set to 40°F (4°C), a 20 lb turkey requires approximately 106 hours and 40 minutes (roughly 4.5 days). If you also plan to dry-brine the bird in the fridge for 24 hours, you should move it from the freezer 5.5 days before cooking day. Using the cold-water emergency method, a 20 lb turkey thaws in about 10 hours with water changed every 30 minutes.',
  },
  {
    id: 'thawed-turkey-lifespan',
    question: 'How long is a thawed turkey good in the fridge before cooking?',
    answer:
      'Once completely thawed in the refrigerator, a fresh or defrosted turkey safely keeps in the fridge (at 40°F or below) for an additional 1 to 2 days before roasting. This means thawing your turkey early is safe and actually recommended to prevent holiday cooking delays.',
  },
  {
    id: 'what-if-late-still-frozen',
    question: 'What if I am late and my turkey is still frozen on Thanksgiving morning?',
    answer:
      'If you missed the refrigerator thawing window, use the USDA cold-water rescue method: keep the turkey sealed in a leak-proof plastic bag, submerge it completely in cold tap water, and change the water every 30 minutes (30 minutes per pound). If even that is too late, you can safely roast a completely frozen turkey in the oven; expect it to take approximately 50% longer to reach the USDA safe internal temperature of 165°F (74°C).',
  },
];
