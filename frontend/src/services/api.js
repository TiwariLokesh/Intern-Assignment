import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE || "/api";
const client = axios.create({ baseURL: apiBase });

export const fetchAvailability = (params) => client.get("/availability", { params }).then((r) => r.data);
export const fetchPricingRules = () => client.get("/pricing-rules").then((r) => r.data);
export const fetchCourts = () => client.get("/courts").then((r) => r.data);
export const fetchEquipment = () => client.get("/equipment").then((r) => r.data);
export const fetchCoaches = () => client.get("/coaches").then((r) => r.data);
export const fetchBookings = () => client.get("/bookings").then((r) => r.data);
export const createBooking = (payload) => client.post("/bookings", payload).then((r) => r.data);
export const cancelBooking = (id) => client.post(`/bookings/${id}/cancel`).then((r) => r.data);
export const quoteBooking = (payload) => client.post("/bookings/quote", payload).then((r) => r.data);

export const createPricingRule = (payload) => client.post("/pricing-rules", payload).then((r) => r.data);
export const updatePricingRule = (id, payload) => client.put(`/pricing-rules/${id}`, payload).then((r) => r.data);
export const deletePricingRule = (id) => client.delete(`/pricing-rules/${id}`).then((r) => r.data);

export const createCourt = (payload) => client.post("/courts", payload).then((r) => r.data);
export const updateCourt = (id, payload) => client.put(`/courts/${id}`, payload).then((r) => r.data);

export const createEquipment = (payload) => client.post("/equipment", payload).then((r) => r.data);
export const updateEquipment = (id, payload) => client.put(`/equipment/${id}`, payload).then((r) => r.data);

export const createCoach = (payload) => client.post("/coaches", payload).then((r) => r.data);
export const updateCoach = (id, payload) => client.put(`/coaches/${id}`, payload).then((r) => r.data);
