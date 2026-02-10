import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local for standalone script execution
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIngredients() {
  console.log('Seeding ingredients...');

  const ingredientsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seed-ingredients.json'), 'utf-8')
  );

  const { data, error } = await supabase
    .from('ingredient_library')
    .upsert(ingredientsData, { onConflict: 'name_en' })
    .select();

  if (error) {
    console.error('Error seeding ingredients:', error);
    throw error;
  }

  console.log(`Seeded ${data.length} ingredients`);
  return data;
}

async function seedProducts() {
  console.log('Seeding products...');

  const productsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seed-products.json'), 'utf-8')
  );

  const { data, error } = await supabase
    .from('products')
    .insert(productsData)
    .select();

  if (error) {
    console.error('Error seeding products:', error);
    throw error;
  }

  console.log(`Seeded ${data.length} products`);
  return data;
}

async function main() {
  console.log('Starting database seed...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('');

  try {
    await seedIngredients();
    await seedProducts();
    console.log('');
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main();
