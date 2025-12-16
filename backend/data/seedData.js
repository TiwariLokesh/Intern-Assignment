export const courts = [
  {
    id: "c1",
    name: "Indoor Court 1",
    type: "indoor",
    status: "active",
    baseRate: 25
  },
  {
    id: "c2",
    name: "Indoor Court 2",
    type: "indoor",
    status: "active",
    baseRate: 25
  },
  {
    id: "c3",
    name: "Outdoor Court 1",
    type: "outdoor",
    status: "active",
    baseRate: 18
  },
  {
    id: "c4",
    name: "Outdoor Court 2",
    type: "outdoor",
    status: "active",
    baseRate: 18
  }
];

export const equipment = [
  {
    id: "e1",
    name: "Racket",
    quantity: 20,
    rentalFee: 5
  },
  {
    id: "e2",
    name: "Shoes",
    quantity: 15,
    rentalFee: 4
  }
];

export const coaches = [
  {
    id: "co1",
    name: "Priya Iyer",
    bio: "Former national player with focus on footwork fundamentals.",
    hourlyRate: 35,
    active: true,
    availability: [
      { dayOfWeek: 1, slots: ["07:00-11:00", "17:00-20:00"] },
      { dayOfWeek: 3, slots: ["07:00-11:00", "17:00-20:00"] },
      { dayOfWeek: 5, slots: ["07:00-12:00"] }
    ]
  },
  {
    id: "co2",
    name: "Arjun Mehta",
    bio: "Doubles specialist focusing on strategy and positioning.",
    hourlyRate: 32,
    active: true,
    availability: [
      { dayOfWeek: 2, slots: ["08:00-12:00", "16:00-19:00"] },
      { dayOfWeek: 4, slots: ["08:00-12:00", "16:00-19:00"] },
      { dayOfWeek: 6, slots: ["09:00-13:00"] }
    ]
  },
  {
    id: "co3",
    name: "Sara Khan",
    bio: "Junior coach with focus on beginners and safe play.",
    hourlyRate: 24,
    active: true,
    availability: [
      { dayOfWeek: 0, slots: ["10:00-14:00"] },
      { dayOfWeek: 2, slots: ["15:00-20:00"] },
      { dayOfWeek: 5, slots: ["15:00-20:00"] }
    ]
  }
];

export const pricingRules = [
  {
    id: "pr1",
    name: "Peak Hours",
    description: "6pm - 9pm premium",
    type: "time",
    enabled: true,
    criteria: { startHour: 18, endHour: 21 },
    amount: 0.2,
    mode: "percent"
  },
  {
    id: "pr2",
    name: "Weekend Premium",
    description: "Higher demand on weekends",
    type: "day-of-week",
    enabled: true,
    criteria: { daysOfWeek: [0, 6] },
    amount: 0.15,
    mode: "percent"
  },
  {
    id: "pr3",
    name: "Indoor Court Premium",
    description: "Indoor courts have controlled environment",
    type: "court-type",
    enabled: true,
    criteria: { courtType: "indoor" },
    amount: 0.1,
    mode: "percent"
  },
  {
    id: "pr4",
    name: "Equipment Service Fee",
    description: "Operational handling fee on rentals",
    type: "equipment",
    enabled: true,
    criteria: {},
    amount: 1.5,
    mode: "flat-per-item"
  },
  {
    id: "pr5",
    name: "Coach Premium",
    description: "Coach sessions include setup and review",
    type: "coach",
    enabled: true,
    criteria: {},
    amount: 5,
    mode: "flat"
  }
];

export const bookings = [];
