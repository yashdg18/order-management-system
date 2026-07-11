/* Seed script: creates sample admin, store managers, customers, stores, products and orders. */
import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderArchive from "../models/OrderArchive.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Store.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    OrderArchive.deleteMany({}),
  ]);

  console.log("Creating admin...");
  await User.create({
    name: "Ava Admin",
    email: "admin@oms.com",
    password: "password123",
    role: "admin",
  });

  console.log("Creating store managers and stores...");
  const managerA = await User.create({
    name: "Marco Rossi",
    email: "manager.northside@oms.com",
    password: "password123",
    role: "store_manager",
  });
  const storeA = await Store.create({
    name: "Northside Grocers",
    address: "12 MG Road, Pune",
    ownerId: managerA._id,
  });
  managerA.storeId = storeA._id;
  await managerA.save();

  const managerB = await User.create({
    name: "Priya Sharma",
    email: "manager.downtown@oms.com",
    password: "password123",
    role: "store_manager",
  });
  const storeB = await Store.create({
    name: "Downtown Fresh Mart",
    address: "45 FC Road, Pune",
    ownerId: managerB._id,
  });
  managerB.storeId = storeB._id;
  await managerB.save();

  console.log("Creating customers...");
  const casey = await User.create({
    name: "Casey Fernandes",
    email: "casey@oms.com",
    password: "password123",
    role: "customer",
  });
  const jordan = await User.create({
    name: "Jordan Mehta",
    email: "jordan@oms.com",
    password: "password123",
    role: "customer",
  });

  console.log("Creating products...");
  const [pizzaMargherita, pizzaPepperoni, garlicBread] = await Product.create([
    { storeId: storeA._id, name: "Margherita Pizza", price: 299, stock: 50, description: "Classic cheese & tomato" },
    { storeId: storeA._id, name: "Pepperoni Pizza", price: 349, stock: 40, description: "Loaded pepperoni" },
    { storeId: storeA._id, name: "Garlic Bread", price: 129, stock: 60, description: "Buttery garlic bread" },
  ]);

  const [butterChicken, paneerTikka, naan] = await Product.create([
    { storeId: storeB._id, name: "Butter Chicken", price: 379, stock: 30, description: "Rich tomato gravy" },
    { storeId: storeB._id, name: "Paneer Tikka", price: 289, stock: 35, description: "Grilled cottage cheese" },
    { storeId: storeB._id, name: "Butter Naan", price: 59, stock: 100, description: "Tandoor baked bread" },
  ]);

  console.log("Creating orders (including one old order for archival testing)...");
  await Order.create({
    storeId: storeA._id,
    customerId: casey._id,
    items: [
      { productId: pizzaMargherita._id, name: pizzaMargherita.name, price: pizzaMargherita.price, quantity: 1 },
      { productId: garlicBread._id, name: garlicBread.name, price: garlicBread.price, quantity: 2 },
    ],
    totalAmount: pizzaMargherita.price + garlicBread.price * 2,
    status: "PLACED",
  });

  await Order.create({
    storeId: storeB._id,
    customerId: jordan._id,
    items: [
      { productId: butterChicken._id, name: butterChicken.name, price: butterChicken.price, quantity: 1 },
      { productId: naan._id, name: naan.name, price: naan.price, quantity: 3 },
    ],
    totalAmount: butterChicken.price + naan.price * 3,
    status: "PREPARING",
  });

  const oldOrder = await Order.create({
    storeId: storeA._id,
    customerId: jordan._id,
    items: [{ productId: pizzaPepperoni._id, name: pizzaPepperoni.name, price: pizzaPepperoni.price, quantity: 2 }],
    totalAmount: pizzaPepperoni.price * 2,
    status: "COMPLETED",
  });
  // Backdate this order 45 days so /api/archive-old-orders has something to archive
  oldOrder.createdAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  await oldOrder.save();

  await Order.create({
    storeId: storeB._id,
    customerId: casey._id,
    items: [{ productId: paneerTikka._id, name: paneerTikka.name, price: paneerTikka.price, quantity: 1 }],
    totalAmount: paneerTikka.price,
    status: "COMPLETED",
  });

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log("Admin:           admin@oms.com / password123");
  console.log("Store Manager A: manager.northside@oms.com / password123");
  console.log("Store Manager B: manager.downtown@oms.com / password123");
  console.log("Customer 1:      casey@oms.com / password123");
  console.log("Customer 2:      jordan@oms.com / password123");
  console.log("---------------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
