import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const bcrypt = await import("bcryptjs");
  const { connectDB } = await import("../lib/mongodb");
  const { Product } = await import("../models/Product");
  const { User } = await import("../models/User");
  const { Category } = await import("../models/Category");
  const { SiteSettings, SITE_SETTINGS_KEY } = await import("../models/SiteSettings");
  const { DEFAULT_SITE_SETTINGS } = await import("../lib/site-settings-defaults");

  await connectDB();

  if (!(await SiteSettings.exists({ key: SITE_SETTINGS_KEY }))) {
    await SiteSettings.create({
      key: SITE_SETTINGS_KEY,
      ...DEFAULT_SITE_SETTINGS,
    });
    console.log("Seeded default SiteSettings (fabric block + hero).");
  }
  await Product.deleteMany({});

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? "admin@nadeetextile.lk";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const userEmail =
    process.env.SEED_USER_EMAIL ?? "customer@nadeetextile.lk";
  const userPassword = process.env.SEED_USER_PASSWORD ?? "User123!";

  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Administrator",
      role: "admin",
    });
  }
  if (!(await User.findOne({ email: userEmail }))) {
    await User.create({
      email: userEmail,
      passwordHash: await bcrypt.hash(userPassword, 10),
      name: "Demo Customer",
      role: "user",
    });
  }
  console.log("Seeded accounts (if missing):", adminEmail, userEmail);

  const samples = [
    {
      name: "Linen Summer Shirt",
      slug: "linen-summer-shirt",
      description:
        "Breathable linen blend, relaxed fit. Ideal for warm days and travel.",
      price: 42.99,
      category: "Shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Sky Blue", "Sand"],
      quantity: 30,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1596755094514-f87a3407b161?w=800&q=80",
      featured: true,
    },
    {
      name: "Merino Knit Pullover",
      slug: "merino-knit-pullover",
      description:
        "Soft merino wool knit with ribbed cuffs. Layer-friendly for office or weekend.",
      price: 68.5,
      category: "Knitwear",
      sizes: ["M", "L", "XL"],
      colors: ["Charcoal", "Cream", "Olive"],
      quantity: 18,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
      featured: true,
    },
    {
      name: "Tailored Cotton Chinos",
      slug: "tailored-cotton-chinos",
      description:
        "Mid-weight cotton twill with a tapered leg. Machine washable, easy care.",
      price: 54.0,
      category: "Trousers",
      sizes: ["30", "32", "34", "36"],
      colors: ["Khaki", "Navy", "Black"],
      quantity: 22,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
      featured: true,
    },
    {
      name: "Organic Tee — Core",
      slug: "organic-tee-core",
      description:
        "GOTS-inspired organic cotton crew neck. Minimal branding, maximum comfort.",
      price: 24.99,
      category: "Basics",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Black", "Gray"],
      quantity: 40,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      featured: false,
    },
    {
      name: "Lightweight Rain Jacket",
      slug: "lightweight-rain-jacket",
      description:
        "Packable shell with taped seams. City commute and weekend hikes.",
      price: 89.99,
      category: "Outerwear",
      sizes: ["M", "L", "XL"],
      colors: ["Navy", "Black"],
      quantity: 12,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
      featured: false,
    },
    {
      name: "Heritage Denim Jacket",
      slug: "heritage-denim-jacket",
      description:
        "Classic indigo wash, contrast stitching. A wardrobe staple year round.",
      price: 79.0,
      category: "Outerwear",
      sizes: ["M", "L", "XL"],
      colors: ["Indigo"],
      quantity: 9,
      active: true,
      imageUrl:
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
      featured: false,
    },
  ];

  const uniqueCategories = [...new Set(samples.map((s) => s.category))];
  for (const name of uniqueCategories) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await Category.findOneAndUpdate(
      { name },
      { name, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  await Product.insertMany(samples);
  console.log(
    `Seeded ${samples.length} products, ${uniqueCategories.length} categories, and ensured demo users in database nadee-textile.`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
