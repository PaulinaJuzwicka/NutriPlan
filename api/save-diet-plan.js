const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'diet-plans');

const ensureOutputDir = async () => {
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating output directory:', err);
      throw new Error('Failed to create output directory');
    }
  }
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const data = Buffer.concat(body).toString();
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
};

const generateDocContent = (plan) => {
  const formatNutrition = (nutrients) => {
    if (!nutrients) return '';
    return `
      <div class="nutrition">
        <h4>Wartości odżywcze (na porcję):</h4>
        <ul>
          <li>Białko: ${nutrients.protein || 0}g</li>
          <li>Tłuszcze: ${nutrients.fat || 0}g</li>
          <li>Węglowodany: ${nutrients.carbs || 0}g</li>
          <li>Błonnik: ${nutrients.fiber || 0}g</li>
          <li>Cukry: ${nutrients.sugar || 0}g</li>
        </ul>
      </div>`;
  };

  const formatMeal = (meal) => `
    <div class="meal">
      <h3>${meal.title || 'Posiłek'}</h3>
      <div class="meal-info">
        <p><strong>Typ:</strong> ${meal.mealType || 'Nieokreślony'}</p>
        <p><strong>Kalorie:</strong> ${meal.calories || '0'} kcal</p>
        ${meal.ingredients ? `
        <div class="ingredients">
          <h4>Składniki:</h4>
          <ul>${meal.ingredients.map(ing => 
            `<li>${ing.amount ? `${ing.amount} ${ing.unit || ''} ` : ''}${ing.name || ''}</li>`
          ).join('')}</ul>
        </div>` : ''}
        ${meal.instructions ? `
        <div class="instructions">
          <h4>Przygotowanie:</h4>
          <ol>${meal.instructions.split('\n')
            .filter(step => step.trim())
            .map(step => `<li>${step}</li>`)
            .join('')}
          </ol>
        </div>` : ''}
        ${formatNutrition(meal.nutrition)}
      </div>
    </div>`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset='UTF-8'>
    <title>Plan żywieniowy: ${plan.name || 'Brak nazwy'}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        margin: 0; 
        padding: 20px; 
        color: #333;
        max-width: 1000px;
        margin: 0 auto;
      }
      h1, h2, h3, h4 { 
        color: #2c3e50;
        margin-top: 1.5em;
      }
      h1 { 
        border-bottom: 2px solid #3498db; 
        padding-bottom: 10px;
      }
      .header-info {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 25px;
      }
      .allergens {
        margin-top: 10px;
        padding: 10px;
        background-color: #fff3cd;
        border-radius: 4px;
        font-size: 0.9em;
      }
      .meal {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
      }
      .meal h3 {
        margin-top: 0;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      .ingredients, .instructions, .nutrition {
        margin: 15px 0;
      }
      ul, ol {
        margin: 5px 0 5px 20px;
        padding: 0;
      }
      li {
        margin: 5px 0;
      }
      @media print {
        body { padding: 0; font-size: 12pt; }
        .meal { page-break-inside: avoid; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <h1>${plan.name || 'Plan żywieniowy'}</h1>
    
    <div class="header-info">
      <div><strong>Dzienne zapotrzebowanie kaloryczne:</strong> ${plan.calories || 'Nie określono'} kcal</div>
      ${(plan.allergens && plan.allergens.length > 0) ? 
        `<div class="allergens">
          <strong>Alergeny do unikania:</strong> ${plan.allergens.join(', ')}
        </div>` : ''}
    </div>

    ${(plan.meals && plan.meals.length > 0) ? 
      `<h2>Posiłki</h2>
      ${plan.meals.map(meal => formatMeal(meal)).join('')}` : 
      '<p>Brak zaplanowanych posiłków.</p>'}

    <div class="no-print" style="margin-top: 50px; font-size: 0.8em; color: #666; text-align: center;">
      Wygenerowano przez NutriPlan - ${new Date().toLocaleDateString('pl-PL')}
    </div>
  </body>
  </html>`;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureOutputDir();

    let plan;
    try {
      plan = await parseBody(req);
    } catch (err) {
      console.error('Error parsing request body:', err);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body',
        details: err.message 
      });
    }

    if (!plan || Object.keys(plan).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Request body is required' 
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `diet-plan-${timestamp}.doc`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const docContent = generateDocContent(plan);

    await writeFile(filePath, docContent, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: 'Diet plan saved successfully',
      file: fileName,
      downloadUrl: `/diet-plans/${fileName}`
    });

  } catch (error) {
    console.error('Error saving diet plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save diet plan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
