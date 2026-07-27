const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const FAQ = require("../models/FAQ");
const connectDB = require("../config/db");

const defaultFaqs = [
  {
    question: 'What makes Wel fragrances unique?',
    answer: "Each Wel fragrance is handcrafted with nature's purest essences, inspired by the vision of our CEO Joel Malabo. We blend traditional perfumery techniques with modern innovation to create scents that are both timeless and deeply personal.",
    order: 1
  },
  {
    question: 'Do you ship to both the Philippines and Canada?',
    answer: 'Yes, we proudly ship to all regions of the Philippines and across Canada. We offer express shipping options to ensure your fragrance arrives in perfect condition, no matter where you are.',
    order: 2
  },
  {
    question: 'How do I choose my signature scent?',
    answer: 'We recommend exploring our fragrance families — Floral, Oriental, Woody, and Fresh. Each scent is designed to resonate with different personalities and moods. You can also visit our boutiques for a personalized consultation.',
    order: 3
  },
  {
    question: 'Are Wel fragrances suitable as gifts?',
    answer: 'Absolutely. Every Wel fragrance comes in elegant, gift-ready packaging. We also offer complimentary gift wrapping and personalized message cards to make your gift truly special.',
    order: 4
  },
  {
    question: 'What is your return policy?',
    answer: "We stand behind the quality of our fragrances. If you're not completely satisfied, you may return unopened products within 14 days for a full refund. Opened products can be exchanged within 7 days.",
    order: 5
  }
];

const seedFaqs = async () => {
  try {
    await connectDB();
    const count = await FAQ.countDocuments();
    if (count === 0) {
      await FAQ.insertMany(defaultFaqs);
      console.log("Successfully seeded 5 default FAQs!");
    } else {
      console.log("FAQs already exist. No seeding required.");
    }
  } catch (error) {
    console.error("Error seeding FAQs:", error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedFaqs();
