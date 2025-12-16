import { courts as seedCourts, equipment as seedEquipment, coaches as seedCoaches, pricingRules as seedPricingRules, bookings as seedBookings } from "./seedData.js";

const db = {
  courts: [...seedCourts],
  equipment: [...seedEquipment],
  coaches: [...seedCoaches],
  pricingRules: [...seedPricingRules],
  bookings: [...seedBookings]
};

export const getDb = () => db;

export const resetDb = () => {
  db.courts = [...seedCourts];
  db.equipment = [...seedEquipment];
  db.coaches = [...seedCoaches];
  db.pricingRules = [...seedPricingRules];
  db.bookings = [];
};
